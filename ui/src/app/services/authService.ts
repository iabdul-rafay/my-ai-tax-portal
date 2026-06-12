// ============================================================
// Auth Service — DEV mock implementation
// Replace the body of each function with real API calls later.
// Endpoint pattern: POST /api/v1/auth/login, POST /api/v1/auth/logout
// ============================================================

import type { LoginCredentials, LoginResponse, User } from "../types";

// DEV: Dummy credentials visible in the Login UI
export const DEV_CREDENTIALS = {
  username: "admin",
  password: "admin123",
};

// DEV: Storage key for persisting auth state across page refreshes
const TOKEN_KEY = "tax_portal_dev_token";
const USER_KEY = "tax_portal_dev_user";

export const authService = {
  /**
   * Login — DEV mock.
   * Replace this function body with:
   *   const res = await fetch('/api/v1/auth/login', { method: 'POST', body: JSON.stringify(credentials) });
   *   return res.json();
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    await simulateNetworkDelay(600);

    if (
      credentials.username !== DEV_CREDENTIALS.username ||
      credentials.password !== DEV_CREDENTIALS.password
    ) {
      throw new Error("Invalid username or password");
    }

    const user: User = {
      id: "USR-001",
      username: "admin",
      fullName: "System Administrator",
      role: "Senior Analyst",
      email: "admin@taxportal.gov.pk",
    };

    // DEV: Generates a static dev token. Replace with real JWT from backend.
    const token = `dev_token_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    return { user, token };
  },

  /** Store auth state in localStorage for dev session persistence */
  persistAuth(token: string, user: User): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  /** Load persisted auth state (dev only; replace with cookie/httpOnly approach in prod) */
  loadPersistedAuth(): { token: string | null; user: User | null } {
    const token = localStorage.getItem(TOKEN_KEY);
    const userRaw = localStorage.getItem(USER_KEY);
    const user: User | null = userRaw ? JSON.parse(userRaw) : null;
    return { token, user };
  },

  /** Clear auth state on logout */
  clearAuth(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  /**
   * Logout — DEV mock.
   * Replace with: await fetch('/api/v1/auth/logout', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
   */
  async logout(_token: string): Promise<void> {
    await simulateNetworkDelay(200);
    this.clearAuth();
  },
};

// ---- Utility ---------------------------------------------------

function simulateNetworkDelay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
