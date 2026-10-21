import { SoundCloudUser, OAuthLoginResponse, OAuthLoginStatusResponse, SavedSoundCloudAccount } from './SoundCloudTypes';
import { get, set, del } from 'idb-keyval';

const SESSION_KEY = 'sonicflow_sc_session';
const TOKEN_KEY = 'sonicflow_sc_token';
const USER_KEY = 'sonicflow_sc_user';
const AUTH_TYPE_KEY = 'sonicflow_sc_auth_type';
const PROFILE_HANDLE_KEY = 'sonicflow_sc_profile_handle';
const IDB_ACCOUNT_KEY = 'sonicflow_sc_saved_account';

export const SC_API_BASE = 'https://api.scnative.dev';
export const SC_DIRECT_API = 'https://api-v2.soundcloud.com';

export type AuthStep = 'idle' | 'opening' | 'waiting' | 'token' | 'extract' | 'finalizing' | 'completed' | 'failed';

export class SoundCloudAuth {
  private static instance: SoundCloudAuth;
  private sessionId: string | null = null;
  private token: string | null = null;
  private authType: 'oauth' | 'token' | 'profile' | null = null;
  private profileHandle: string | null = null;
  private user: SoundCloudUser | null = null;
  private listeners: Set<(user: SoundCloudUser | null) => void> = new Set();

  // Active OAuth Flow State
  private activeLoginRequestId: string | null = null;
  private activeAuthUrl: string | null = null;
  private pollTimer: ReturnType<typeof setTimeout> | null = null;
  private isPollingActive = false;

  private constructor() {
    this.restoreFromLocalStorage();
    this.restoreFromIndexedDb();
  }

  public static getInstance(): SoundCloudAuth {
    if (!SoundCloudAuth.instance) {
      SoundCloudAuth.instance = new SoundCloudAuth();
    }
    return SoundCloudAuth.instance;
  }

  private restoreFromLocalStorage(): void {
    if (typeof localStorage === 'undefined') return;

    this.sessionId = localStorage.getItem(SESSION_KEY);
    this.token = localStorage.getItem(TOKEN_KEY);
    this.authType = (localStorage.getItem(AUTH_TYPE_KEY) as any) || null;
    this.profileHandle = localStorage.getItem(PROFILE_HANDLE_KEY);

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

  private async restoreFromIndexedDb(): Promise<void> {
    if (typeof window === 'undefined' || typeof indexedDB === 'undefined') return;
    try {
      const saved = await get<SavedSoundCloudAccount>(IDB_ACCOUNT_KEY);
      if (saved && saved.user) {
        if (!this.user) {
          this.user = saved.user;
          this.sessionId = saved.sessionId || null;
          this.token = saved.token || null;
          this.authType = saved.authType || null;
          this.profileHandle = saved.profileHandle || null;

          // Re-persist to localStorage
          this.persistCurrentState();
          this.notify();
        }
      }
    } catch (e) {
      console.warn('Could not read from IndexedDB account store:', e);
    }
  }

  private async persistCurrentState(): Promise<void> {
    if (typeof localStorage === 'undefined') return;

    if (this.sessionId) localStorage.setItem(SESSION_KEY, this.sessionId);
    else localStorage.removeItem(SESSION_KEY);

    if (this.token) localStorage.setItem(TOKEN_KEY, this.token);
    else localStorage.removeItem(TOKEN_KEY);

    if (this.authType) localStorage.setItem(AUTH_TYPE_KEY, this.authType);
    else localStorage.removeItem(AUTH_TYPE_KEY);

    if (this.profileHandle) localStorage.setItem(PROFILE_HANDLE_KEY, this.profileHandle);
    else localStorage.removeItem(PROFILE_HANDLE_KEY);

    if (this.user) {
      const serialized = JSON.stringify(this.user);
      localStorage.setItem(USER_KEY, serialized);

      // Async backup to IndexedDB for maximum durability
      if (typeof window !== 'undefined' && typeof indexedDB !== 'undefined') {
        try {
          const record: SavedSoundCloudAccount = {
            user: this.user,
            authType: this.authType || 'profile',
            sessionId: this.sessionId,
            token: this.token,
            profileHandle: this.profileHandle,
            savedAt: Date.now(),
          };
          await set(IDB_ACCOUNT_KEY, record);
        } catch (e) {
          console.warn('Failed to backup account to IndexedDB:', e);
        }
      }
    } else {
      localStorage.removeItem(USER_KEY);
      if (typeof window !== 'undefined' && typeof indexedDB !== 'undefined') {
        try {
          await del(IDB_ACCOUNT_KEY);
        } catch (e) {}
      }
    }
  }

  public isAuthenticated(): boolean {
    return Boolean(this.user && (this.sessionId || this.token || this.authType === 'profile'));
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

  public getAuthType(): 'oauth' | 'token' | 'profile' | null {
    return this.authType;
  }

  public getProfileHandle(): string | null {
    return this.profileHandle;
  }

  public getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: 'application/json, text/plain, */*',
    };
    if (this.sessionId) {
      headers['x-session-id'] = this.sessionId;
    }
    if (this.token) {
      headers['Authorization'] = `OAuth ${this.token}`;
    }
    return headers;
  }

  /**
   * 1-Click Native OAuth Flow (через api.scnative.dev/auth/login)
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

      // Открываем страницу авторизации SoundCloud в системном браузере
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
   * Открывает URL в браузере по умолчанию.
   */
  public static openInDefaultBrowser(url: string): void {
    if (!url || typeof window === 'undefined') return;

    fetch(`/api/open-browser?url=${encodeURIComponent(url)}`).catch(() => {});

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
    const MAX_DURATION_MS = 10 * 60 * 1000;
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
        // Retry on network glitch
      }

      if (this.isPollingActive) {
        this.pollTimer = setTimeout(poll, POLL_INTERVAL_MS);
      }
    };

    this.pollTimer = setTimeout(poll, POLL_INTERVAL_MS);
  }

  /**
   * Сохранение сессии от https://api.scnative.dev
   */
  public async setSession(sessionId: string): Promise<{ success: boolean; user?: SoundCloudUser; error?: string }> {
    const cleanSession = sessionId.trim();
    if (!cleanSession) {
      return { success: false, error: 'Session ID не может быть пустым' };
    }

    try {
      this.sessionId = cleanSession;
      this.authType = 'oauth';

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
      userData.authType = 'oauth';
      this.user = userData;

      await this.persistCurrentState();
      this.notify();
      return { success: true, user: userData };
    } catch (err: any) {
      return { success: false, error: `Ошибка подключения: ${err?.message || err}` };
    }
  }

  /**
   * Подключение профиля SoundCloud по ссылке или нику (без пароля)
   * Пример: "https://soundcloud.com/skrillex" или "skrillex" или "@skrillex"
   */
  public async connectWithProfile(usernameOrUrl: string, clientResolver?: (cleanHandle: string) => Promise<SoundCloudUser | null>): Promise<{ success: boolean; user?: SoundCloudUser; error?: string }> {
    let clean = usernameOrUrl.trim();
    if (!clean) {
      return { success: false, error: 'Введите ник или ссылку на SoundCloud профиль' };
    }

    clean = clean.replace(/^@/, '');
    if (clean.includes('soundcloud.com/')) {
      const match = clean.match(/soundcloud\.com\/([^/?#]+)/);
      if (match) clean = match[1];
    }

    try {
      let resolvedUser: SoundCloudUser | null = null;
      if (clientResolver) {
        resolvedUser = await clientResolver(clean);
      }

      if (!resolvedUser) {
        return { success: false, error: `Пользователь "${clean}" не найден в SoundCloud` };
      }

      resolvedUser.authType = 'profile';
      this.user = resolvedUser;
      this.authType = 'profile';
      this.profileHandle = clean;

      await this.persistCurrentState();
      this.notify();
      return { success: true, user: resolvedUser };
    } catch (err: any) {
      return { success: false, error: `Ошибка при поиске профиля: ${err?.message || err}` };
    }
  }

  /**
   * Вход по OAuth токену
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
      userData.authType = 'token';
      this.token = cleanToken;
      this.user = userData;
      this.authType = 'token';

      await this.persistCurrentState();
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
          userData.authType = 'oauth';
          this.user = userData;
          await this.persistCurrentState();
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
          userData.authType = 'token';
          this.user = userData;
          await this.persistCurrentState();
          this.notify();
          return;
        } else if (res.status === 401) {
          this.logout();
          return;
        }
      } catch (e) {
        console.warn('Failed to refresh user via token:', e);
      }
    }

    if (this.authType === 'profile' && this.user) {
      // Profile is already persistent
      this.notify();
    }
  }

  public logout(): void {
    this.cancelOAuthLogin();
    this.sessionId = null;
    this.token = null;
    this.user = null;
    this.authType = null;
    this.profileHandle = null;

    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(AUTH_TYPE_KEY);
      localStorage.removeItem(PROFILE_HANDLE_KEY);
    }

    if (typeof window !== 'undefined' && typeof indexedDB !== 'undefined') {
      try {
        del(IDB_ACCOUNT_KEY).catch(() => {});
      } catch (e) {}
    }

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
