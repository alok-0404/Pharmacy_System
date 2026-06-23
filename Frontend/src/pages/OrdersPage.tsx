import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Package } from 'lucide-react';
import { getOrders, getOrder, ORDER_NEXT_ACTIONS, ORDER_STATUS_LABELS, updateOrderStatus } from '../api/orders';
import { ApiClientError } from '../api/client';
import { usePharmacy } from '../context/PharmacyContext';
import type { Order, OrderStatus, PopulatedPatient } from '../types';

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
  const { pharmacyId } = usePharmacy();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');

  const loadOrders = async () => {
    if (!pharmacyId) return;

    setLoading(true);
    setError(null);

    try {
      setOrders(await getOrders(pharmacyId));
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOrders();
  }, [pharmacyId]);

  useEffect(() => {
    if (!pharmacyId || !selectedId) {
      setSelectedOrder(null);
      return;
    }

    void getOrder(pharmacyId, selectedId)
      .then(setSelectedOrder)
      .catch((err) => {
        setError(err instanceof ApiClientError ? err.message : 'Failed to load order');
      });
  }, [pharmacyId, selectedId]);

  const handleStatusChange = async (status: OrderStatus) => {
    if (!pharmacyId || !selectedOrder) return;

    setUpdating(true);
    setError(null);

    try {
      const updated = await updateOrderStatus(pharmacyId, selectedOrder._id, {
        status,
        rejectionReason: status === 'prescription_rejected' ? rejectionReason : undefined,
        paymentAmount:
          status === 'payment_pending' && paymentAmount ? Number(paymentAmount) : undefined,
        refillDueAt:
          status === 'order_completed'
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            : undefined,
      });

      setSelectedOrder(updated);
      setOrders((prev) => prev.map((o) => (o._id === updated._id ? updated : o)));
      setRejectionReason('');
      setPaymentAmount('');
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to update order');
    } finally {
      setUpdating(false);
    }
  };

  const nextActions = selectedOrder ? ORDER_NEXT_ACTIONS[selectedOrder.status] ?? [] : [];

  return (
    <div className="flex h-full bg-zinc-950">
      <section className="flex w-96 shrink-0 flex-col border-r border-zinc-800 bg-zinc-900/50">
        <div className="border-b border-zinc-800 px-4 py-4">
          <h1 className="text-lg font-semibold text-white">Orders</h1>
          <p className="text-xs text-zinc-500">Prescription to delivery lifecycle</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-12 text-zinc-500">
              <Loader2 className="animate-spin" size={24} />
            </div>
          ) : orders.length === 0 ? (
            <p className="px-4 py-8 text-sm text-zinc-500">
              No orders yet. Patients can upload prescriptions on WhatsApp.
            </p>
          ) : (
            orders.map((order) => (
              <button
                key={order._id}
                type="button"
                onClick={() => setSelectedId(order._id)}
                className={`w-full border-b border-zinc-800 px-4 py-4 text-left transition hover:bg-zinc-800/50 ${
                  selectedId === order._id ? 'bg-violet-500/10' : ''
                }`}
              >
                <p className="font-medium text-white">{getPatientName(order.patientId)}</p>
                <p className="mt-1 text-xs text-zinc-500">{getPatientMobile(order.patientId)}</p>
                <span className="mt-2 inline-block rounded-full bg-zinc-800 px-2.5 py-0.5 text-[11px] font-medium text-violet-300">
                  {formatStatus(order.status)}
                </span>
              </button>
            ))
          )}
        </div>
      </section>

      <section className="min-w-0 flex-1 overflow-y-auto p-6 lg:p-8">
        {!selectedOrder ? (
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
              selectedOrder.prescriptionId?.fileUrl ? (
                <div className="mt-4">
                  <p className="mb-2 text-sm text-zinc-500">Prescription</p>
                  {selectedOrder.prescriptionId.mimeType?.startsWith('image/') ? (
                    <img
                      src={selectedOrder.prescriptionId.fileUrl}
                      alt="Prescription"
                      className="max-h-64 rounded-xl border border-zinc-700 object-contain"
                    />
                  ) : (
                    <a
                      href={selectedOrder.prescriptionId.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-violet-400 hover:underline"
                    >
                      View prescription file
                    </a>
                  )}
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

                  {nextActions.includes('payment_pending') ? (
                    <input
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="Payment amount (₹)"
                      type="number"
                      min="0"
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
