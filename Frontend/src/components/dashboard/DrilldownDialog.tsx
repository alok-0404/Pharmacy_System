import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { ORDER_STATUS_LABELS } from '../../api/orders';
import { exportRowsToCsv } from '../../utils/exportCsv';
import type { DashboardAnalytics } from '../../types/dashboard';

export type DrilldownType = 'orders' | 'patients' | 'prescriptions' | 'deliveries' | null;

interface DrilldownDialogProps {
  type: DrilldownType;
  data: DashboardAnalytics | null;
  pharmacyName?: string;
  onClose: () => void;
}

export function DrilldownDialog({ type, data, pharmacyName, onClose }: DrilldownDialogProps) {
  const [search, setSearch] = useState('');

  const titleMap: Record<Exclude<DrilldownType, null>, string> = {
    orders: 'Order History',
    patients: 'Active Patients',
    prescriptions: 'Pending Prescriptions',
    deliveries: 'Active Deliveries',
  };

  const filteredOrders = useMemo(() => {
    if (!data || type !== 'orders') return [];
    const q = search.trim().toLowerCase();
    return data.orders.recent.filter((order) => {
      if (!q) return true;
      return (
        order.patientName.toLowerCase().includes(q) ||
        order.orderId.toLowerCase().includes(q) ||
        order.status.toLowerCase().includes(q)
      );
    });
  }, [data, search, type]);

  const filteredPatients = useMemo(() => {
    if (!data || type !== 'patients') return [];
    const q = search.trim().toLowerCase();
    return data.patients.active.filter((patient) => {
      if (!q) return true;
      return (
        patient.name.toLowerCase().includes(q) ||
        patient.mobile.includes(q) ||
        (patient.email?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [data, search, type]);

  const filteredPrescriptions = useMemo(() => {
    if (!data || type !== 'prescriptions') return [];
    const q = search.trim().toLowerCase();
    return data.prescriptions.pending.filter((item) => {
      if (!q) return true;
      return (
        item.patientName.toLowerCase().includes(q) ||
        item.patientMobile.includes(q) ||
        item.orderId.toLowerCase().includes(q)
      );
    });
  }, [data, search, type]);

  const filteredDeliveries = useMemo(() => {
    if (!data || type !== 'deliveries') return [];
    const q = search.trim().toLowerCase();
    return data.deliveries.active.filter((item) => {
      if (!q) return true;
      return (
        item.patientName.toLowerCase().includes(q) ||
        item.patientMobile.includes(q) ||
        item.status.toLowerCase().includes(q)
      );
    });
  }, [data, search, type]);

  const handleExport = () => {
    if (!data || !type) return;

    if (type === 'orders') {
      exportRowsToCsv(
        'orders.csv',
        ['Order ID', 'Patient', 'Status', 'Payment', 'Amount', 'Updated'],
        filteredOrders.map((order) => [
          order.orderId,
          order.patientName,
          ORDER_STATUS_LABELS[order.status] ?? order.status,
          order.paymentStatus ?? '',
          String(order.paymentAmount ?? ''),
          order.updatedAt ? new Date(order.updatedAt).toLocaleString() : '',
        ]),
      );
      return;
    }

    if (type === 'patients') {
      exportRowsToCsv(
        'patients.csv',
        ['Name', 'Mobile', 'Email', 'Orders', 'Last Status', 'Last Activity'],
        filteredPatients.map((patient) => [
          patient.name,
          patient.mobile,
          patient.email ?? '',
          String(patient.orderCount),
          patient.lastOrderStatus ?? '',
          patient.lastActivity ? new Date(patient.lastActivity).toLocaleString() : '',
        ]),
      );
      return;
    }

    if (type === 'prescriptions') {
      exportRowsToCsv(
        'pending-prescriptions.csv',
        ['Order ID', 'Patient', 'Mobile', 'Status', 'Waiting (min)', 'Priority'],
        filteredPrescriptions.map((item) => [
          item.orderId,
          item.patientName,
          item.patientMobile,
          ORDER_STATUS_LABELS[item.status] ?? item.status,
          String(item.waitingMinutes),
          item.priority,
        ]),
      );
      return;
    }

    exportRowsToCsv(
      'active-deliveries.csv',
      ['Order ID', 'Patient', 'Mobile', 'Status', 'Type', 'Delayed'],
      filteredDeliveries.map((item) => [
        item.orderId,
        item.patientName,
        item.patientMobile,
        ORDER_STATUS_LABELS[item.status] ?? item.status,
        item.deliveryType ?? '',
        item.isDelayed ? 'Yes' : 'No',
      ]),
    );
  };

  return (
    <Dialog open={Boolean(type)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-4xl overflow-hidden">
        <DialogHeader>
          <DialogTitle>{type ? titleMap[type] : 'Details'}</DialogTitle>
          <DialogDescription>
            {pharmacyName ? `${pharmacyName} · ` : ''}
            Search, review, and export records without leaving the dashboard.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2 pl-9 pr-3 text-sm text-white outline-none focus:border-violet-500"
            />
          </div>
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-900"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>

        <div className="max-h-[55vh] overflow-y-auto rounded-xl border border-zinc-800">
          {type === 'orders' ? (
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 bg-zinc-900 text-left text-zinc-400">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Patient</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Updated</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.orderId} className="border-t border-zinc-800 text-zinc-200">
                    <td className="px-4 py-3 font-mono text-xs">
                      #{order.orderId.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-4 py-3">{order.patientName}</td>
                    <td className="px-4 py-3">{ORDER_STATUS_LABELS[order.status] ?? order.status}</td>
                    <td className="px-4 py-3">{order.paymentStatus ?? '—'}</td>
                    <td className="px-4 py-3 text-zinc-400">
                      {order.updatedAt ? new Date(order.updatedAt).toLocaleString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}

          {type === 'patients' ? (
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 bg-zinc-900 text-left text-zinc-400">
                <tr>
                  <th className="px-4 py-3">Patient</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Orders</th>
                  <th className="px-4 py-3">Last status</th>
                  <th className="px-4 py-3">Last activity</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient) => (
                  <tr key={patient.patientId} className="border-t border-zinc-800 text-zinc-200">
                    <td className="px-4 py-3">{patient.name}</td>
                    <td className="px-4 py-3">{patient.mobile}</td>
                    <td className="px-4 py-3">{patient.orderCount}</td>
                    <td className="px-4 py-3">
                      {patient.lastOrderStatus
                        ? ORDER_STATUS_LABELS[patient.lastOrderStatus]
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                      {patient.lastActivity
                        ? new Date(patient.lastActivity).toLocaleString()
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}

          {type === 'prescriptions' ? (
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 bg-zinc-900 text-left text-zinc-400">
                <tr>
                  <th className="px-4 py-3">Patient</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Waiting</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPrescriptions.map((item) => (
                  <tr key={item.orderId} className="border-t border-zinc-800 text-zinc-200">
                    <td className="px-4 py-3">
                      <p>{item.patientName}</p>
                      <p className="text-xs text-zinc-500">{item.patientMobile}</p>
                    </td>
                    <td className="px-4 py-3">{ORDER_STATUS_LABELS[item.status] ?? item.status}</td>
                    <td className="px-4 py-3">{item.waitingMinutes} min</td>
                    <td className="px-4 py-3 capitalize">{item.priority}</td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/dashboard/orders?order=${item.orderId}`}
                        className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-500"
                        onClick={onClose}
                      >
                        Continue Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}

          {type === 'deliveries' ? (
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 bg-zinc-900 text-left text-zinc-400">
                <tr>
                  <th className="px-4 py-3">Patient</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Order time</th>
                  <th className="px-4 py-3">Flag</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeliveries.map((item) => (
                  <tr key={item.orderId} className="border-t border-zinc-800 text-zinc-200">
                    <td className="px-4 py-3">
                      <p>{item.patientName}</p>
                      <p className="text-xs text-zinc-500">{item.patientMobile}</p>
                    </td>
                    <td className="px-4 py-3">{ORDER_STATUS_LABELS[item.status] ?? item.status}</td>
                    <td className="px-4 py-3">{item.deliveryType ?? '—'}</td>
                    <td className="px-4 py-3 text-zinc-400">
                      {item.orderTime ? new Date(item.orderTime).toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {item.isDelayed ? (
                        <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs text-amber-300">
                          Delayed
                        </span>
                      ) : (
                        <span className="text-zinc-500">On track</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
