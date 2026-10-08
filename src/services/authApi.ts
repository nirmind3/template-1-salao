// API service for Admin Authentication and Server-side Database synchronization
// NOTE: No passwords, tokens, or credentials are hardcoded here.
// Credentials are sent directly via encrypted/secure POST requests to the backend server.

const SESSION_TOKEN_KEY = 'salao_admin_session_token';
const ADMIN_USERNAME_KEY = 'salao_admin_username';

export interface LoginResponse {
  success: boolean;
  token?: string;
  username?: string;
  error?: string;
}

export interface VerifyResponse {
  valid: boolean;
  username?: string;
  error?: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message?: string;
  token?: string;
  error?: string;
}

export const authApi = {
  getToken(): string | null {
    try {
      return sessionStorage.getItem(SESSION_TOKEN_KEY) || localStorage.getItem(SESSION_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  getUsername(): string {
    try {
      return sessionStorage.getItem(ADMIN_USERNAME_KEY) || localStorage.getItem(ADMIN_USERNAME_KEY) || 'admin';
    } catch {
      return 'admin';
    }
  },

  setSession(token: string, username: string): void {
    try {
      sessionStorage.setItem(SESSION_TOKEN_KEY, token);
      sessionStorage.setItem(ADMIN_USERNAME_KEY, username);
      localStorage.setItem(SESSION_TOKEN_KEY, token);
      localStorage.setItem(ADMIN_USERNAME_KEY, username);
    } catch (e) {
      console.warn('Could not store session token', e);
    }
  },

  clearSession(): void {
    try {
      sessionStorage.removeItem(SESSION_TOKEN_KEY);
      sessionStorage.removeItem(ADMIN_USERNAME_KEY);
      localStorage.removeItem(SESSION_TOKEN_KEY);
      localStorage.removeItem(ADMIN_USERNAME_KEY);
    } catch (e) {
      console.warn('Could not clear session token', e);
    }
  },

  async login(username: string, password: string): Promise<LoginResponse> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          error: data.error || 'Credenciais inválidas. Verifique seu usuário e senha.',
        };
      }

      if (data.token) {
        this.setSession(data.token, data.username || username);
      }

      return {
        success: true,
        token: data.token,
        username: data.username,
      };
    } catch (err: any) {
      return {
        success: false,
        error: 'Não foi possível conectar ao servidor de autenticação. Tente novamente.',
      };
    }
  },

  async verifySession(): Promise<VerifyResponse> {
    const token = this.getToken();
    if (!token) {
      return { valid: false };
    }

    try {
      const res = await fetch('/api/auth/verify', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        this.clearSession();
        return { valid: false };
      }

      const data = await res.json();
      return { valid: Boolean(data.valid), username: data.username };
    } catch {
      // In case of offline/network glitch, check if we have a locally stored valid token format
      return { valid: false };
    }
  },

  async logout(): Promise<void> {
    const token = this.getToken();
    this.clearSession();

    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (e) {
        // Silent ignore on network close
      }
    }
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<ChangePasswordResponse> {
    const token = this.getToken();
    if (!token) {
      return { success: false, error: 'Sessão expirada. Faça login novamente.' };
    }

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          error: data.error || 'Falha ao alterar senha no banco de dados.',
        };
      }

      if (data.token) {
        this.setSession(data.token, this.getUsername());
      }

      return {
        success: true,
        message: data.message || 'Senha alterada com sucesso!',
      };
    } catch (err: any) {
      return {
        success: false,
        error: 'Erro de comunicação ao atualizar senha.',
      };
    }
  },

  async syncWithDatabase(payload: { salonConfig?: any; haircuts?: any[] }): Promise<boolean> {
    const token = this.getToken();
    if (!token) return false;

    try {
      const res = await fetch('/api/admin/save-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async fetchInitialData(): Promise<{ salonConfig?: any; haircuts?: any[] } | null> {
    try {
      const res = await fetch('/api/data');
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },
};
