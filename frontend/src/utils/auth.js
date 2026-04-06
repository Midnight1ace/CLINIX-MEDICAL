const AUTH_KEY = "clinix_auth_v1";

function safeStorage() {
  if (typeof window === "undefined") return null;
  return { local: window.localStorage, session: window.sessionStorage };
}

export function getAuth() {
  const storage = safeStorage();
  if (!storage) return null;
  const raw = storage.local.getItem(AUTH_KEY) || storage.session.getItem(AUTH_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

export function setAuth(payload, options = {}) {
  const storage = safeStorage();
  if (!storage) return;
  const remember = options.remember !== false;
  const target = remember ? storage.local : storage.session;
  const other = remember ? storage.session : storage.local;
  target.setItem(AUTH_KEY, JSON.stringify(payload));
  other.removeItem(AUTH_KEY);
}

export function clearAuth() {
  const storage = safeStorage();
  if (!storage) return;
  storage.local.removeItem(AUTH_KEY);
  storage.session.removeItem(AUTH_KEY);
}

export function hasRole(auth, role) {
  if (!auth) return false;
  return auth.role === role;
}
