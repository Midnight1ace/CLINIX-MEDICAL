// Secure authentication using HTTP-only cookies
// No client-side storage of tokens for security

export function getAuth() {
  // In a real implementation, this would make a request to an auth endpoint
  // that reads from HTTP-only cookies and returns user info
  // For now, we'll return null to force re-authentication
  // This maintains the same interface but removes localStorage usage
  return null;
}

export function setAuth() {
  // Auth is now handled via HTTP-only cookies on the backend
  // Login is handled directly in the login pages by calling the backend endpoints
  // This function is kept for compatibility but does nothing
  return;
}

export function clearAuth() {
  // Auth is cleared by calling logout endpoint which clears cookies
  // This function is kept for compatibility but does nothing client-side
  // Actual logout happens via logout endpoint
  return;
}

export function hasRole(auth, role) {
  if (!auth) return false;
  return auth.role === role;
}

// Helper to check if we should show dev login warning
export function isDevLoginEnabled() {
  return process.env.NODE_ENV === 'development';
}