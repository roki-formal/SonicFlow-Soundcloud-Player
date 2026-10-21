import { SoundCloudUser, OAuthLoginResponse, OAuthLoginStatusResponse } from './SoundCloudTypes';

const SESSION_KEY = 'sonicflow_sc_session';
const TOKEN_KEY = 'sonicflow_sc_token';
const USER_KEY = 'sonicflow_sc_user';

export const SC_API_BASE = 'https://api.scnative.dev';
export const SC_DIRECT_API = 'https://api-v2.soundcloud.com';

export type AuthStep = 'idle' | 'opening' | 'waiting' | 'token' | 'extract' | 'finalizing' | 'completed' | 'failed';

export class SoundCloudAuth {
  private static instance: SoundCloudAuth;
  private sessionId: string | null = null;
  private token: string | null = null;
  private user: SoundCloudUser | null = null;
  private listeners: Set<(user: SoundCloudUser | null) => void> = new Set();

  // Active OAuth Flow State
  private activeLoginRequestId: string | null = null;
  private activeAuthUrl: string | null = null;
  private pollTimer: ReturnType<typeof setTimeout> | null = null;
  private isPollingActive = false;

  private constructor() {
    this.sessionId = localStorage.getItem(SESSION_KEY);
    this.token = localStorage.getItem(TOKEN_KEY);
    const cachedUser = localStorage.getItem(USER_KEY);
    if (cachedUser) {
      try {
        this.user = JSON.parse(cachedUser);
      } catch (e) {
        console.error('Failed to parse cached SoundCloud user:', e);
      }
    }

    if ((this.sessionId || this.token) && !this.user) {
      this.refreshUser();
    }
  }

  public static getInstance(): SoundCloudAuth {
    if (!SoundCloudAuth.instance) {
      SoundCloudAuth.instance = new SoundCloudAuth();
    }
    return SoundCloudAuth.instance;
  }

  public isAuthenticated(): boolean {
    return Boolean((this.sessionId || this.token) && this.user);
  }

  public getSessionId(): string | null {
    return this.sessionId;
  }

  public getToken(): string | null {
    return this.token;
  }

  public getUser(): SoundCloudUser | null {
    return this.user;
  }

  public getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: 'application/json, text/plain, */*',
    };
    if (this.sessionId) {
      headers['x-session-id'] = this.sessionId;
    }
    return headers;
  }

  /**
   * 1-Click Native OAuth Flow (как в SoundCloud-Desktop)
   * 1. Запрашивает URL авторизации у https://api.scnative.dev/auth/login
   * 2. Открывает окно авторизации в браузере
   * 3. Опрашивает статус в фоне, пока пользователь подтверждает вход на soundcloud.com
   */
  public async startOAuthLogin(options: {
    onStepChange?: (step: AuthStep) => void;
    onError?: (error: string) => void;
    onSuccess?: (user: SoundCloudUser) => void;
  } = {}): Promise<{ url: string; loginRequestId: string }> {
    this.cancelOAuthLogin();
    const { onStepChange, onError, onSuccess } = options;

    if (onStepChange) onStepChange('opening');

    try {
      const res = await fetch(`${SC_API_BASE}/auth/login`, {
        headers: this.getAuthHeaders(),
      });

      if (!res.ok) {
        throw new Error(`Ошибка запроса авторизации (HTTP ${res.status})`);
      }

      const data: OAuthLoginResponse = await res.json();
      this.activeLoginRequestId = data.loginRequestId;
      this.activeAuthUrl = data.url;

      // Открываем страницу авторизации SoundCloud в браузере по умолчанию
      SoundCloudAuth.openInDefaultBrowser(data.url);

      if (onStepChange) onStepChange('waiting');
      this.isPollingActive = true;
      this.startPollingStatus(data.loginRequestId, options);

      return data;
    } catch (err: any) {
      const msg = err?.message || 'Не удалось связаться с сервером авторизации';
      if (onError) onError(msg);
      if (onStepChange) onStepChange('failed');
      throw err;
    }
  }

  /**
   * Открывает URL в браузере пользователя по умолчанию.
   * 1. В лаунчере SonicFlow вызывает /api/open-browser, запуская системный браузер Windows.
   * 2. В веб-режиме открывает полноценную вкладку.
   */
  public static openInDefaultBrowser(url: string): void {
    if (!url || typeof window === 'undefined') return;

    // Вызываем нативный API лаунчера для открытия системного браузера по умолчанию
    fetch(`/api/open-browser?url=${encodeURIComponent(url)}`).catch(() => {});

    // В обычном браузере также открываем стандартную вкладку (без popup размеров)
    try {
      window.open(url, '_blank');
    } catch (e) {
      console.warn('Could not open tab:', e);
    }
  }

  public getActiveAuthUrl(): string | null {
    return this.activeAuthUrl;
  }

  public reopenAuthUrl(): void {
    if (this.activeAuthUrl) {
      SoundCloudAuth.openInDefaultBrowser(this.activeAuthUrl);
    }
  }

  public cancelOAuthLogin(): void {
    this.isPollingActive = false;
    if (this.pollTimer) {
      clearTimeout(this.pollTimer);
      this.pollTimer = null;
    }
    this.activeLoginRequestId = null;
    this.activeAuthUrl = null;
  }

  private startPollingStatus(
    loginRequestId: string,
    callbacks: {
      onStepChange?: (step: AuthStep) => void;
      onError?: (error: string) => void;
      onSuccess?: (user: SoundCloudUser) => void;
    }
  ): void {
    const { onStepChange, onError, onSuccess } = callbacks;
    const POLL_INTERVAL_MS = 800;
    const MAX_DURATION_MS = 10 * 60 * 1000; // 10 минут
    const startTime = Date.now();

    const poll = async () => {
      if (!this.isPollingActive || this.activeLoginRequestId !== loginRequestId) {
        return;
      }

      if (Date.now() - startTime > MAX_DURATION_MS) {
        this.cancelOAuthLogin();
        if (onError) onError('Время ожидания входа истекло. Пожалуйста, попробуйте снова.');
        if (onStepChange) onStepChange('failed');
        return;
      }

      try {
        const res = await fetch(`${SC_API_BASE}/auth/login/status?id=${encodeURIComponent(loginRequestId)}`, {
          cache: 'no-store',
        });

        if (res.ok) {
          const statusData: OAuthLoginStatusResponse = await res.json();

          if (statusData.step && onStepChange) {
            onStepChange(statusData.step as AuthStep);
          }

          if (statusData.status === 'completed' && statusData.sessionId) {
            this.cancelOAuthLogin();
            if (onStepChange) onStepChange('finalizing');

            // Устанавливаем полученную сессию
            const setRes = await this.setSession(statusData.sessionId);
            if (setRes.success && setRes.user) {
              if (onStepChange) onStepChange('completed');
              if (onSuccess) onSuccess(setRes.user);
            } else {
              if (onError) onError(setRes.error || 'Не удалось получить профиль пользователя');
              if (onStepChange) onStepChange('failed');
            }
            return;
          }

          if (statusData.status === 'failed' || statusData.status === 'expired') {
            this.cancelOAuthLogin();
            if (onError) onError(statusData.error || 'Авторизация отменена или не удалась');
            if (onStepChange) onStepChange('failed');
            return;
          }
        }
      } catch (err) {
        // Временная ошибка сети при опросе — продолжаем опрашивать
      }

      if (this.isPollingActive) {
        this.pollTimer = setTimeout(poll, POLL_INTERVAL_MS);
      }
    };

    this.pollTimer = setTimeout(poll, POLL_INTERVAL_MS);
  }

  /**
   * Применение сессионного токена от https://api.scnative.dev
   */
  public async setSession(sessionId: string): Promise<{ success: boolean; user?: SoundCloudUser; error?: string }> {
    const cleanSession = sessionId.trim();
    if (!cleanSession) {
      return { success: false, error: 'Session ID не может быть пустым' };
    }

    try {
      this.sessionId = cleanSession;
      localStorage.setItem(SESSION_KEY, cleanSession);

      // Запрашиваем актуальный профиль пользователя через /me/cold или /me
      let res = await fetch(`${SC_API_BASE}/me/cold`, {
        headers: this.getAuthHeaders(),
      });

      if (!res.ok) {
        res = await fetch(`${SC_API_BASE}/me`, {
          headers: this.getAuthHeaders(),
        });
      }

      if (!res.ok) {
        return { success: false, error: `Не удалось загрузить профиль SoundCloud (HTTP ${res.status})` };
      }

      const userData: SoundCloudUser = await res.json();
      this.user = userData;
      localStorage.setItem(USER_KEY, JSON.stringify(userData));

      this.notify();
      return { success: true, user: userData };
    } catch (err: any) {
      return { success: false, error: `Ошибка подключения: ${err?.message || err}` };
    }
  }

  /**
   * Альтернативный прямой вход по oauth_token (cookie)
   */
  public async loginWithToken(token: string): Promise<{ success: boolean; user?: SoundCloudUser; error?: string }> {
    const cleanToken = token.trim();
    if (!cleanToken) {
      return { success: false, error: 'Токен авторизации не может быть пустым' };
    }

    try {
      const res = await fetch(`${SC_DIRECT_API}/me?oauth_token=${encodeURIComponent(cleanToken)}`);
      if (!res.ok) {
        return { success: false, error: `Неверный токен SoundCloud (HTTP ${res.status})` };
      }

      const userData: SoundCloudUser = await res.json();
      this.token = cleanToken;
      this.user = userData;

      localStorage.setItem(TOKEN_KEY, cleanToken);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));

      this.notify();
      return { success: true, user: userData };
    } catch (err: any) {
      return { success: false, error: `Сетевая ошибка: ${err?.message || err}` };
    }
  }

  public async refreshUser(): Promise<void> {
    if (this.sessionId) {
      try {
        const res = await fetch(`${SC_API_BASE}/me/cold`, {
          headers: this.getAuthHeaders(),
        });
        if (res.ok) {
          const userData: SoundCloudUser = await res.json();
          this.user = userData;
          localStorage.setItem(USER_KEY, JSON.stringify(userData));
          this.notify();
          return;
        } else if (res.status === 401) {
          this.logout();
          return;
        }
      } catch (e) {
        console.warn('Failed to refresh user via session:', e);
      }
    }

    if (this.token) {
      try {
        const res = await fetch(`${SC_DIRECT_API}/me?oauth_token=${encodeURIComponent(this.token)}`);
        if (res.ok) {
          const userData: SoundCloudUser = await res.json();
          this.user = userData;
          localStorage.setItem(USER_KEY, JSON.stringify(userData));
          this.notify();
        } else if (res.status === 401) {
          this.logout();
        }
      } catch (e) {
        console.warn('Failed to refresh user via token:', e);
      }
    }
  }

  public logout(): void {
    this.cancelOAuthLogin();
    this.sessionId = null;
    this.token = null;
    this.user = null;
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.notify();
  }

  public subscribe(cb: (user: SoundCloudUser | null) => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private notify(): void {
    this.listeners.forEach((cb) => cb(this.user));
  }
}
