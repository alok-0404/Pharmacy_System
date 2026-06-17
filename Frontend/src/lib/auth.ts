const AUTH_USERS_KEY = 'btbiz_pharmacy_users';

export interface PharmacyUser {
  pharmacyId: string;
  pharmacyName: string;
  ownerName: string;
  email: string;
  mobile: string;
  city: string;
  password: string;
}

interface AuthUsersStore {
  [email: string]: PharmacyUser;
}

function readStore(): AuthUsersStore {
  try {
    const raw = localStorage.getItem(AUTH_USERS_KEY);
    return raw ? (JSON.parse(raw) as AuthUsersStore) : {};
  } catch {
    return {};
  }
}

function writeStore(store: AuthUsersStore) {
  localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(store));
}

export function registerPharmacyUser(user: PharmacyUser) {
  const store = readStore();
  const email = user.email.toLowerCase();

  if (store[email]) {
    throw new Error('An account with this email already exists');
  }

  store[email] = { ...user, email };
  writeStore(store);
}

export function loginPharmacyUser(email: string, password: string): PharmacyUser {
  const store = readStore();
  const user = store[email.toLowerCase()];

  if (!user || user.password !== password) {
    throw new Error('Invalid email or password');
  }

  return user;
}

export function getUserByPharmacyId(pharmacyId: string): PharmacyUser | null {
  const store = readStore();
  return Object.values(store).find((u) => u.pharmacyId === pharmacyId) ?? null;
}
