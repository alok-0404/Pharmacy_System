import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Loader2, Package, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { getOrders, getOrder, ORDER_NEXT_ACTIONS, ORDER_STATUS_LABELS, sendOrderPaymentDetails, updateOrderStatus } from '../api/orders';
import { ApiClientError } from '../api/client';
import { usePharmacy } from '../context/PharmacyContext';
import { usePolling } from '../hooks/usePolling';
import { SkeletonOrderDetail, SkeletonOrderList } from '../components/ui/skeleton';
import { MediaAttachment } from '../components/chat/MediaAttachment';
import { isResolvableMediaPath, resolveMediaUrl } from '../utils/media';
import { formatRelative } from '../utils/format';
import type { Order, OrderStatus, Pharmacy, PopulatedPatient } from '../types';

const ATTENTION_STATUSES = new Set<OrderStatus>(['prescription_received', 'order_verified']);

function formatOrderRef(orderId: string): string {
  return `#${orderId.slice(-6).toUpperCase()}`;
}

function isNewOrder(order: Order): boolean {
  return order.status === 'prescription_received';
}

function needsPharmacistAction(order: Order): boolean {
  return ATTENTION_STATUSES.has(order.status);
}

function isRecentlyCreated(order: Order, withinHours = 6): boolean {
  if (!order.createdAt) {
    return false;
  }

  const ageMs = Date.now() - new Date(order.createdAt).getTime();
  return ageMs >= 0 && ageMs <= withinHours * 60 * 60 * 1000;
}

const ORDERS_POLL_MS = 5_000;

function resolvePaymentDefaults(order: Order | null, pharmacy: Pharmacy | null) {
  return {
    amount: order?.paymentAmount?.toString() ?? '',
    link: order?.paymentLinkUrl || pharmacy?.paymentLinkUrl || '',
    qr: order?.paymentQrImageUrl || pharmacy?.paymentQrImageUrl || '',
  };
}

function getPatientName(patient: PopulatedPatient | string): string {
  return typeof patient === 'object' ? patient.name : 'Patient';
}

function getPatientMobile(patient: PopulatedPatient | string): string {
  return typeof patient === 'object' ? patient.mobile : '';
}

function formatStatus(status: OrderStatus): string {
  return ORDER_STATUS_LABELS[status] ?? status.replace(/_/g, ' ');
}

export function OrdersPage() {
  const { pharmacyId, pharmacy } = usePharmacy();
  const [searchParams] = useSearchParams();
  const deepLinkOrderId = searchParams.get('order');
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentLinkUrl, setPaymentLinkUrl] = useState('');
  const [paymentQrImageUrl, setPaymentQrImageUrl] = useState('');
  const [sendingPayment, setSendingPayment] = useState(false);
  const statusUpdateInFlight = useRef(false);
  const paymentFormDirty = useRef(false);

  const loadOrders = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!pharmacyId) return;

      if (!options?.silent) {
        setLoading(true);
        setError(null);
      }

      try {
        setOrders(await getOrders(pharmacyId));
      } catch (err) {
        if (!options?.silent) {
          setError(err instanceof ApiClientError ? err.message : 'Failed to load orders');
        }
      } finally {
        if (!options?.silent) {
          setLoading(false);
        }
      }
    },
    [pharmacyId],
  );

  const refreshSelectedOrder = useCallback(async () => {
    if (!pharmacyId || !selectedId) {
      return null;
    }

    try {
      const fresh = await getOrder(pharmacyId, selectedId);
      setSelectedOrder(fresh);
      setOrders((prev) => prev.map((order) => (order._id === fresh._id ? fresh : order)));
      return fresh;
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to load order');
      return null;
    }
  }, [pharmacyId, selectedId]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    if (deepLinkOrderId) {
      setSelectedId(deepLinkOrderId);
    }
  }, [deepLinkOrderId]);

  usePolling(() => loadOrders({ silent: true }), ORDERS_POLL_MS, Boolean(pharmacyId));

  usePolling(() => void refreshSelectedOrder(), ORDERS_POLL_MS, Boolean(pharmacyId && selectedId));

  useEffect(() => {
    if (!pharmacyId || !selectedId) {
      setSelectedOrder(null);
      return;
    }

    paymentFormDirty.current = false;
    void refreshSelectedOrder().then((order) => {
      if (order) {
        applyPaymentFields(order);
      }
    });
  }, [pharmacyId, selectedId]);

  const applyPaymentFields = (order: Order | null) => {
    const defaults = resolvePaymentDefaults(order, pharmacy);
    setPaymentAmount(defaults.amount);
    setPaymentLinkUrl(defaults.link);
    setPaymentQrImageUrl(defaults.qr);
  };

  useEffect(() => {
    if (paymentFormDirty.current || !selectedOrder) {
      return;
    }

    applyPaymentFields(selectedOrder);
  }, [pharmacy?.paymentLinkUrl, pharmacy?.paymentQrImageUrl]);

  const handleStatusChange = async (status: OrderStatus) => {
    if (!pharmacyId || !selectedOrder || statusUpdateInFlight.current) return;

    statusUpdateInFlight.current = true;
    setUpdating(true);
    setError(null);

    try {
      const resolvedLink = paymentLinkUrl.trim() || pharmacy?.paymentLinkUrl || undefined;
      const resolvedQr = paymentQrImageUrl.trim() || pharmacy?.paymentQrImageUrl || undefined;

      const updated = await updateOrderStatus(pharmacyId, selectedOrder._id, {
        status,
        rejectionReason: status === 'prescription_rejected' ? rejectionReason : undefined,
        paymentAmount:
          status === 'payment_pending' && paymentAmount ? Number(paymentAmount) : undefined,
        paymentLinkUrl: status === 'payment_pending' ? resolvedLink : undefined,
        paymentQrImageUrl: status === 'payment_pending' ? resolvedQr : undefined,
        refillDueAt:
          status === 'order_completed'
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            : undefined,
      });

      setSelectedOrder(updated);
      setOrders((prev) => prev.map((o) => (o._id === updated._id ? updated : o)));
      setRejectionReason('');
      paymentFormDirty.current = false;
      applyPaymentFields(updated);

      if (status === 'payment_pending') {
        toast.success('Payment link & QR sent to patient on WhatsApp');
      } else if (updated.status === status) {
        toast.success(`Order marked as ${formatStatus(status)}`);
      }
    } catch (err) {
      const message = err instanceof ApiClientError ? err.message : 'Failed to update order';

      if (message.includes('Cannot transition')) {
        const fresh = await refreshSelectedOrder();
        if (fresh?.status === status) {
          toast.info(`Order is already ${formatStatus(status)}`);
          setError(null);
        } else {
          setError(`Status changed on server — now showing "${formatStatus(fresh?.status ?? selectedOrder.status)}".`);
        }
      } else {
        setError(message);
      }
    } finally {
      statusUpdateInFlight.current = false;
      setUpdating(false);
    }
  };

  const handleSendPayment = async (sendMode: 'link' | 'qr' | 'both' = 'both') => {
    if (!pharmacyId || !selectedOrder) return;

    const resolvedLink = paymentLinkUrl.trim() || pharmacy?.paymentLinkUrl || undefined;
    const resolvedQr = paymentQrImageUrl.trim() || pharmacy?.paymentQrImageUrl || undefined;

    if (sendMode === 'link' && !resolvedLink) {
      toast.error('Payment link missing — add it in Settings or enter above');
      return;
    }

    if (sendMode === 'qr' && !resolvedQr) {
      toast.error('QR image missing — upload it in Settings or enter above');
      return;
    }

    if (sendMode === 'both' && !resolvedLink && !resolvedQr) {
      toast.error('Add payment link or QR in Settings first');
      return;
    }

    setSendingPayment(true);
    setError(null);

    try {
      const updated = await sendOrderPaymentDetails(pharmacyId, selectedOrder._id, {
        paymentLinkUrl: resolvedLink,
        paymentQrImageUrl: resolvedQr,
        sendMode,
        paymentAmount: paymentAmount ? Number(paymentAmount) : undefined,
      });
      setSelectedOrder(updated);
      setOrders((prev) => prev.map((o) => (o._id === updated._id ? updated : o)));
      paymentFormDirty.current = false;
      applyPaymentFields(updated);
      toast.success(
        sendMode === 'qr'
          ? 'QR code sent to patient on WhatsApp'
          : sendMode === 'link'
            ? 'Payment link sent to patient on WhatsApp'
            : 'Payment link & QR sent to patient on WhatsApp',
      );
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to send payment details');
    } finally {
      setSendingPayment(false);
    }
  };

  const nextActions = selectedOrder ? ORDER_NEXT_ACTIONS[selectedOrder.status] ?? [] : [];

  const showPaymentFields =
    selectedOrder &&
    (selectedOrder.status === 'payment_pending' || nextActions.includes('payment_pending'));

  const paymentQrPreview =
    paymentQrImageUrl && isResolvableMediaPath(paymentQrImageUrl)
      ? resolveMediaUrl(paymentQrImageUrl)
      : null;

  const pendingReviewCount = orders.filter((order) => needsPharmacistAction(order)).length;

  return (
    <div className="flex h-full bg-zinc-950">
      <section className="flex w-96 shrink-0 flex-col border-r border-zinc-800 bg-zinc-900/50">
        <div className="border-b border-zinc-800 px-4 py-4">
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-lg font-semibold text-white">Orders</h1>
            {pendingReviewCount > 0 ? (
              <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-amber-300">
                {pendingReviewCount} need review
              </span>
            ) : null}
          </div>
          <p className="text-xs text-zinc-500">Prescription to delivery lifecycle</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <SkeletonOrderList />
          ) : orders.length === 0 ? (
            <p className="px-4 py-8 text-sm text-zinc-500">
              No orders yet. Patients can upload prescriptions on WhatsApp.
            </p>
          ) : (
            orders.map((order) => {
              const isNew = isNewOrder(order);
              const isRecent = isRecentlyCreated(order);
              const needsAction = needsPharmacistAction(order);
              const isSelected = selectedId === order._id;

              return (
              <button
                key={order._id}
                type="button"
                onClick={() => setSelectedId(order._id)}
                className={`relative w-full border-b border-zinc-800 px-4 py-4 text-left transition hover:bg-zinc-800/50 ${
                  isSelected ? 'bg-violet-500/10' : ''
                } ${isNew ? 'border-l-4 border-l-emerald-500 bg-emerald-500/5' : needsAction ? 'border-l-4 border-l-amber-500/80' : ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-white">{getPatientName(order.patientId)}</p>
                  {isNew ? (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-300">
                      <Sparkles size={10} />
                      New
                    </span>
                  ) : isRecent && needsAction ? (
                    <span className="shrink-0 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                      Review
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 font-mono text-xs font-semibold text-violet-300">
                  {formatOrderRef(order._id)}
                </p>
                <p className="mt-0.5 text-xs text-zinc-500">
                  {order.createdAt ? formatRelative(order.createdAt) : '—'}
                  {order.createdAt
                    ? ` · ${new Date(order.createdAt).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}`
                    : ''}
                </p>
                <p className="mt-1 text-xs text-zinc-600">{getPatientMobile(order.patientId)}</p>
                <span className="mt-2 inline-block rounded-full bg-zinc-800 px-2.5 py-0.5 text-[11px] font-medium text-violet-300">
                  {formatStatus(order.status)}
                </span>
              </button>
            );
            })
          )}
        </div>
      </section>

      <section className="min-w-0 flex-1 overflow-y-auto p-6 lg:p-8">
        {selectedId && !selectedOrder ? (
          <SkeletonOrderDetail />
        ) : !selectedOrder ? (
          <div className="flex h-full flex-col items-center justify-center text-zinc-500">
            <Package size={40} className="mb-3 opacity-40" />
            <p>Select an order to manage its status</p>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white">
                Order #{selectedOrder._id.slice(-6).toUpperCase()}
              </h2>
              <p className="mt-1 text-sm text-zinc-400">
                {getPatientName(selectedOrder.patientId)} · {getPatientMobile(selectedOrder.patientId)}
              </p>
              {selectedOrder.createdAt ? (
                <p className="mt-1 text-xs text-zinc-500">
                  Received {formatRelative(selectedOrder.createdAt)} (
                  {new Date(selectedOrder.createdAt).toLocaleString('en-IN')})
                </p>
              ) : null}
              {selectedOrder.conversationId ? (
                <Link
                  to="/dashboard/inbox"
                  className="mt-2 inline-block text-sm text-violet-400 hover:text-violet-300"
                >
                  Open in Inbox →
                </Link>
              ) : null}
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
              <p className="text-sm text-zinc-500">Current status</p>
              <p className="mt-1 text-lg font-semibold text-violet-300">
                {formatStatus(selectedOrder.status)}
              </p>

              {typeof selectedOrder.prescriptionId === 'object' &&
              selectedOrder.prescriptionId?.fileUrl &&
              isResolvableMediaPath(selectedOrder.prescriptionId.fileUrl) ? (
                <div className="mt-4">
                  <p className="mb-2 text-sm text-zinc-500">Prescription</p>
                  <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
                    <MediaAttachment
                      content={selectedOrder.prescriptionId.fileUrl}
                      alt="Prescription"
                    />
                  </div>
                </div>
              ) : null}

              {showPaymentFields ? (
                <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-amber-200">Payment details</p>
                      <p className="mt-1 text-xs text-amber-100/70">
                        Auto-filled from Settings — edit if needed, then send to patient on WhatsApp.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        paymentFormDirty.current = false;
                        applyPaymentFields(selectedOrder);
                      }}
                      className="shrink-0 rounded-lg border border-amber-500/30 px-2.5 py-1 text-xs text-amber-100 hover:bg-amber-500/20"
                    >
                      Reload from Settings
                    </button>
                  </div>

                  {selectedOrder.paymentDetailsSentAt ? (
                    <p className="mt-2 text-xs text-amber-100/70">
                      Last sent: {new Date(selectedOrder.paymentDetailsSentAt).toLocaleString()}
                    </p>
                  ) : null}

                  <div className="mt-3 space-y-2">
                    <label className="text-xs text-amber-100/80">Payment amount (₹)</label>
                    <input
                      value={paymentAmount}
                      onChange={(e) => {
                        paymentFormDirty.current = true;
                        setPaymentAmount(e.target.value);
                      }}
                      placeholder="e.g. 320"
                      type="number"
                      min="0"
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-violet-500"
                    />

                    <label className="text-xs text-amber-100/80">Payment link</label>
                    <input
                      value={paymentLinkUrl}
                      onChange={(e) => {
                        paymentFormDirty.current = true;
                        setPaymentLinkUrl(e.target.value);
                      }}
                      placeholder={
                        pharmacy?.paymentLinkUrl
                          ? 'From Settings'
                          : 'Add payment link in Settings'
                      }
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-violet-500"
                    />

                    <label className="text-xs text-amber-100/80">QR code image</label>
                    <input
                      value={paymentQrImageUrl}
                      onChange={(e) => {
                        paymentFormDirty.current = true;
                        setPaymentQrImageUrl(e.target.value);
                      }}
                      placeholder={
                        pharmacy?.paymentQrImageUrl ? 'From Settings' : 'Upload QR in Settings'
                      }
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-violet-500"
                    />

                    {paymentQrPreview ? (
                      <img
                        src={paymentQrPreview}
                        alt="Payment QR preview"
                        className="mt-1 max-h-36 rounded-lg border border-zinc-700 bg-white p-2"
                      />
                    ) : null}

                    <Link
                      to="/dashboard/settings"
                      className="inline-block text-xs text-violet-400 hover:text-violet-300"
                    >
                      Change defaults in Settings →
                    </Link>

                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        type="button"
                        disabled={sendingPayment}
                        onClick={() => void handleSendPayment('qr')}
                        className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-500 disabled:opacity-50"
                      >
                        Send QR to WhatsApp
                      </button>
                      <button
                        type="button"
                        disabled={sendingPayment}
                        onClick={() => void handleSendPayment('link')}
                        className="rounded-xl border border-amber-500/40 px-4 py-2 text-sm font-medium text-amber-100 hover:bg-amber-500/20 disabled:opacity-50"
                      >
                        Send Link
                      </button>
                      <button
                        type="button"
                        disabled={sendingPayment}
                        onClick={() => void handleSendPayment('both')}
                        className="rounded-xl border border-amber-500/40 px-4 py-2 text-sm font-medium text-amber-100 hover:bg-amber-500/20 disabled:opacity-50"
                      >
                        Send Link & QR
                      </button>
                    </div>

                    {nextActions.includes('payment_pending') ? (
                      <p className="text-xs text-zinc-400">
                        Or click <strong className="text-zinc-300">Payment Pending</strong> below to
                        change status and auto-send link & QR.
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : null}

              <div className="mt-6">
                <p className="mb-3 text-sm font-medium text-zinc-300">Status timeline</p>
                <ul className="space-y-2">
                  {[...selectedOrder.statusHistory].reverse().map((entry, i) => (
                    <li key={`${entry.status}-${i}`} className="flex gap-3 text-sm">
                      <span className="shrink-0 text-zinc-600">
                        {entry.changedAt
                          ? new Date(entry.changedAt).toLocaleString()
                          : '—'}
                      </span>
                      <span className="text-zinc-300">{formatStatus(entry.status)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {nextActions.length > 0 ? (
                <div className="mt-6 space-y-3 border-t border-zinc-800 pt-6">
                  <p className="text-sm font-medium text-zinc-300">Update status</p>

                  {nextActions.includes('prescription_rejected') ? (
                    <input
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Rejection reason (if rejecting)"
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-violet-500"
                    />
                  ) : null}

                  <div className="flex flex-wrap gap-2">
                    {nextActions.map((status) => (
                      <button
                        key={status}
                        type="button"
                        disabled={updating}
                        onClick={() => void handleStatusChange(status)}
                        className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50"
                      >
                        {updating ? (
                          <Loader2 className="animate-spin" size={16} />
                        ) : (
                          formatStatus(status)
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            {error ? (
              <p className="mt-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </p>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}
