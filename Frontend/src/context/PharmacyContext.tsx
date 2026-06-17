import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { getPharmacy } from '../api/pharmacy';
import type { Pharmacy } from '../types';
import { ApiClientError } from '../api/client';

const STORAGE_KEY = 'btbiz_pharmacy_id';

interface PharmacyContextValue {
  pharmacyId: string | null;
  pharmacy: Pharmacy | null;
  loading: boolean;
  error: string | null;
  setPharmacyId: (id: string) => Promise<void>;
  clearPharmacy: () => void;
  refreshPharmacy: () => Promise<void>;
}

const PharmacyContext = createContext<PharmacyContextValue | null>(null);

export function PharmacyProvider({ children }: { children: ReactNode }) {
  const [pharmacyId, setPharmacyIdState] = useState<string | null>(
    () => localStorage.getItem(STORAGE_KEY),
  );
  const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem(STORAGE_KEY)));
  const [error, setError] = useState<string | null>(null);

  const loadPharmacy = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const data = await getPharmacy(id);
      setPharmacy(data);
      setPharmacyIdState(id);
      localStorage.setItem(STORAGE_KEY, id);
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : 'Failed to load pharmacy';
      setError(message);
      setPharmacy(null);
      setPharmacyIdState(null);
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (pharmacyId) {
      void loadPharmacy(pharmacyId);
    } else {
      setLoading(false);
    }
  }, [pharmacyId, loadPharmacy]);

  const setPharmacyId = useCallback(
    async (id: string) => {
      await loadPharmacy(id);
    },
    [loadPharmacy],
  );

  const clearPharmacy = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setPharmacyIdState(null);
    setPharmacy(null);
    setError(null);
  }, []);

  const value = useMemo(
    () => ({
      pharmacyId,
      pharmacy,
      loading,
      error,
      setPharmacyId,
      clearPharmacy,
      refreshPharmacy: async () => {
        if (pharmacyId) {
          await loadPharmacy(pharmacyId);
        }
      },
    }),
    [pharmacyId, pharmacy, loading, error, setPharmacyId, clearPharmacy, loadPharmacy],
  );

  return (
    <PharmacyContext.Provider value={value}>{children}</PharmacyContext.Provider>
  );
}

export function usePharmacy() {
  const context = useContext(PharmacyContext);

  if (!context) {
    throw new Error('usePharmacy must be used within PharmacyProvider');
  }

  return context;
}
