import { Navigate, Route, Routes } from 'react-router-dom';
import { PharmacyProvider, usePharmacy } from './context/PharmacyContext';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { LandingPage } from './pages/LandingPage';
import { DashboardHomePage } from './pages/DashboardHomePage';
import { InboxPage } from './pages/InboxPage';
import { PatientsPage } from './pages/PatientsPage';
import { SettingsPage } from './pages/SettingsPage';
import { Loader2 } from 'lucide-react';

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-violet-400">
      <Loader2 className="animate-spin" size={36} />
    </div>
  );
}

function ProtectedDashboard() {
  const { pharmacyId, pharmacy, loading } = usePharmacy();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!pharmacyId || !pharmacy) {
    return <Navigate to="/" replace />;
  }

  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route index element={<DashboardHomePage />} />
        <Route path="inbox" element={<InboxPage />} />
        <Route path="patients" element={<PatientsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

function AppRoutes() {
  const { pharmacyId, pharmacy, loading } = usePharmacy();

  if (loading && pharmacyId) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          pharmacyId && pharmacy ? <Navigate to="/dashboard" replace /> : <LandingPage />
        }
      />
      <Route path="/dashboard/*" element={<ProtectedDashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <PharmacyProvider>
      <AppRoutes />
    </PharmacyProvider>
  );
}
