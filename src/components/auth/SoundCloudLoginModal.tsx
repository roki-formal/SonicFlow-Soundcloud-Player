import React, { useState } from 'react';
import { 
  X, 
  LogIn, 
  LogOut, 
  RefreshCw, 
  ExternalLink, 
  KeyRound, 
  ShieldCheck, 
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Radio,
  Zap,
  Sparkles,
  UserCheck,
  Link as LinkIcon
} from 'lucide-react';
import { SoundCloudAuth, AuthStep } from '../../core/soundcloud/SoundCloudAuth';
import { SoundCloudClient } from '../../core/soundcloud/SoundCloudClient';
import { SoundCloudUser } from '../../core/soundcloud/SoundCloudTypes';
import { usePlayer } from '../../core/player/PlayerContext';

interface SoundCloudLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type TabType = 'oauth' | 'profile' | 'token';

export const SoundCloudLoginModal: React.FC<SoundCloudLoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const auth = SoundCloudAuth.getInstance();
  const client = SoundCloudClient.getInstance();
  const { syncSoundCloudData, isSyncing } = usePlayer();

  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [profileInput, setProfileInput] = useState('');
  const [tokenInput, setTokenInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [user, setUser] = useState<SoundCloudUser | null>(auth.getUser());
  const [oauthStep, setOauthStep] = useState<AuthStep>('idle');

  React.useEffect(() => {
    return auth.subscribe((u) => setUser(u));
  }, [auth]);

  if (!isOpen) return null;

  // 1-Click OAuth Login Flow
  const handleOAuthLogin = async () => {
    setError(null);
    setSuccessMsg(null);
    setLoading(true);
    setOauthStep('opening');

    try {
      await auth.startOAuthLogin({
        onStepChange: (step) => {
          setOauthStep(step);
          if (step === 'completed') {
            setLoading(false);
            setSuccessMsg('Аккаунт успешно подключен и сохранен!');
            syncSoundCloudData();
            if (onSuccess) onSuccess();
          } else if (step === 'failed') {
            setLoading(false);
          }
        },
        onError: (err) => {
          setError(err);
          setLoading(false);
          setOauthStep('failed');
        },
        onSuccess: (loggedUser) => {
          setUser(loggedUser);
          setLoading(false);
          setSuccessMsg(`Добро пожаловать, ${loggedUser.username}!`);
          syncSoundCloudData();
          if (onSuccess) onSuccess();
        },
      });
    } catch (err: any) {
      setError(err?.message || 'Не удалось открыть окно авторизации SoundCloud');
      setLoading(false);
      setOauthStep('failed');
    }
  };

  const handleCancelOAuth = () => {
    auth.cancelOAuthLogin();
    setOauthStep('idle');
    setLoading(false);
  };

  // Profile handle / URL connection
  const handleProfileConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileInput.trim()) {
      setError('Пожалуйста, введите ник или ссылку на профиль SoundCloud');
      return;
    }

    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    const res = await auth.connectWithProfile(profileInput, (clean) => client.resolveUser(clean));
    setLoading(false);

    if (res.success && res.user) {
      setUser(res.user);
      setSuccessMsg(`Профиль ${res.user.username} успешно синхронизирован и сохранен!`);
      setProfileInput('');
      await syncSoundCloudData();
      if (onSuccess) onSuccess();
    } else {
      setError(res.error || 'Не удалось найти профиль в SoundCloud');
    }
  };

  // Manual Token Login
  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) {
      setError('Пожалуйста, введите oauth_token');
      return;
    }

    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    const res = await auth.loginWithToken(tokenInput);
    setLoading(false);

    if (res.success && res.user) {
      setUser(res.user);
      setSuccessMsg('Вход по токену выполнен успешно!');
      setTokenInput('');
      await syncSoundCloudData();
      if (onSuccess) onSuccess();
    } else {
      setError(res.error || 'Неверный токен SoundCloud');
    }
  };

  const handleLogout = () => {
    auth.logout();
    setUser(null);
    setError(null);
    setSuccessMsg(null);
    setOauthStep('idle');
  };

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    await auth.refreshUser();
    await syncSoundCloudData();
    setLoading(false);
    setSuccessMsg('Данные аккаунта обновлены!');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 80,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div 
        style={{
          width: '560px',
          maxWidth: '100%',
          backgroundColor: 'var(--color-bg-surface)',
          borderRadius: 'var(--radius-modal, 16px)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div 
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, rgba(255, 85, 0, 0.12) 0%, transparent 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div 
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#ff5500',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 2px 8px rgba(255, 85, 0, 0.4)',
              }}
            >
              <Radio size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>
                SoundCloud Аккаунт
              </h2>
              <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: 0 }}>
                Полная синхронизация лайков, плейлистов и треков
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {/* Success Banner */}
          {successMsg && (
            <div 
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#10b981',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px',
              }}
            >
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div 
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#ef4444',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px',
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {user ? (
            /* Logged In View */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div 
                style={{
                  padding: '18px 20px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--color-bg-base)',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                }}
              >
                <img 
                  src={user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200'} 
                  alt={user.username}
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid #ff5500',
                    boxShadow: '0 4px 14px rgba(255, 85, 0, 0.3)',
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user.username}
                    </h3>
                    <span 
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        backgroundColor: 'rgba(16, 185, 129, 0.18)',
                        color: '#10b981',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                      }}
                    >
                      Сохранен ✓
                    </span>
                  </div>

                  <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '0 0 8px 0' }}>
                    {user.city ? `${user.city}, ` : ''}{user.country || 'SoundCloud'}
                  </p>

                  <div style={{ display: 'flex', gap: '14px', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                    <span>❤️ <b>{user.likes_count ?? 0}</b> лайков</span>
                    <span>📑 <b>{user.playlist_count ?? 0}</b> плейлистов</span>
                    <span>👥 <b>{user.followers_count ?? 0}</b> подписчиков</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={handleRefresh}
                  disabled={loading || isSyncing}
                  className="btn-interactive"
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    borderRadius: 'var(--radius-control)',
                    backgroundColor: '#ff5500',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: (loading || isSyncing) ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(255, 85, 0, 0.35)',
                  }}
                >
                  <RefreshCw size={15} className={(loading || isSyncing) ? 'animate-spin' : ''} />
                  <span>{isSyncing ? 'Синхронизация...' : 'Синхронизировать сейчас'}</span>
                </button>

                <button
                  onClick={handleLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 16px',
                    borderRadius: 'var(--radius-control)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <LogOut size={15} />
                  <span>Выйти / Сменить</span>
                </button>
              </div>
            </div>
          ) : (
            /* Not Logged In View */
            <div>
              {/* Tab Selector */}
              <div 
                style={{
                  display: 'flex',
                  gap: '6px',
                  backgroundColor: 'var(--color-bg-base)',
                  padding: '4px',
                  borderRadius: '10px',
                  marginBottom: '20px',
                }}
              >
                <button
                  type="button"
                  onClick={() => { setActiveTab('profile'); setError(null); }}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: activeTab === 'profile' ? 'var(--color-bg-surface)' : 'transparent',
                    color: activeTab === 'profile' ? '#ff5500' : 'var(--color-text-secondary)',
                    fontWeight: activeTab === 'profile' ? 700 : 500,
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: activeTab === 'profile' ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
                  }}
                >
                  <UserCheck size={14} />
                  <span>По ссылке / нику</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setActiveTab('oauth'); setError(null); }}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: activeTab === 'oauth' ? 'var(--color-bg-surface)' : 'transparent',
                    color: activeTab === 'oauth' ? '#ff5500' : 'var(--color-text-secondary)',
                    fontWeight: activeTab === 'oauth' ? 700 : 500,
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: activeTab === 'oauth' ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
                  }}
                >
                  <Zap size={14} />
                  <span>1-Click Браузер</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setActiveTab('token'); setError(null); }}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: activeTab === 'token' ? 'var(--color-bg-surface)' : 'transparent',
                    color: activeTab === 'token' ? '#ff5500' : 'var(--color-text-secondary)',
                    fontWeight: activeTab === 'token' ? 700 : 500,
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: activeTab === 'token' ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
                  }}
                >
                  <KeyRound size={14} />
                  <span>OAuth Токен</span>
                </button>
              </div>

              {/* Tab 1: Profile Link or Username */}
              {activeTab === 'profile' && (
                <form onSubmit={handleProfileConnect} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                    Самый простой способ: введите ваш ник в SoundCloud или ссылку на профиль. Мы загрузим все ваши лайки, плейлисты и треки.
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
                      Никнейм или ссылка на профиль
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type="text"
                        placeholder="например, skrillex или https://soundcloud.com/username"
                        value={profileInput}
                        onChange={(e) => setProfileInput(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          paddingRight: '36px',
                          borderRadius: 'var(--radius-control)',
                          backgroundColor: 'var(--color-bg-base)',
                          border: '1px solid var(--color-border)',
                          color: 'var(--color-text-primary)',
                          fontSize: '13px',
                          outline: 'none',
                        }}
                      />
                      <LinkIcon size={16} style={{ position: 'absolute', right: '12px', top: '12px', color: 'var(--color-text-muted)' }} />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !profileInput.trim()}
                    className="btn-interactive"
                    style={{
                      marginTop: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '12px 18px',
                      borderRadius: 'var(--radius-control)',
                      background: 'linear-gradient(135deg, #ff5500 0%, #ff2200 100%)',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: (loading || !profileInput.trim()) ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 14px rgba(255, 85, 0, 0.35)',
                    }}
                  >
                    {loading ? <RefreshCw size={15} className="animate-spin" /> : <Sparkles size={15} />}
                    <span>{loading ? 'Подключение профиля...' : 'Синхронизировать и Сохранить'}</span>
                  </button>
                </form>
              )}

              {/* Tab 2: 1-Click OAuth Login Flow */}
              {activeTab === 'oauth' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                    Нажмите кнопку ниже, чтобы открыть официальную страницу входа SoundCloud в браузере. После подтверждения аккаунт подключится автоматически.
                  </div>

                  {oauthStep === 'idle' && (
                    <button
                      type="button"
                      onClick={handleOAuthLogin}
                      disabled={loading}
                      className="btn-interactive"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        padding: '12px 18px',
                        borderRadius: 'var(--radius-control)',
                        background: 'linear-gradient(135deg, #ff5500 0%, #ff2200 100%)',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 4px 14px rgba(255, 85, 0, 0.35)',
                      }}
                    >
                      <ExternalLink size={15} />
                      <span>Открыть вход в браузере</span>
                    </button>
                  )}

                  {['opening', 'waiting', 'token', 'extract', 'finalizing'].includes(oauthStep) && (
                    <div 
                      style={{
                        padding: '20px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255, 85, 0, 0.08)',
                        border: '1px solid rgba(255, 85, 0, 0.25)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '12px',
                        textAlign: 'center',
                      }}
                    >
                      <RefreshCw size={28} className="animate-spin" style={{ color: '#ff5500' }} />
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '4px' }}>
                          Ожидание подтверждения в браузере...
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                          Пожалуйста, подтвердите вход на открывшейся странице soundcloud.com
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                        <button
                          type="button"
                          onClick={() => auth.reopenAuthUrl()}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '6px',
                            backgroundColor: 'var(--color-bg-surface)',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-text-primary)',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Открыть окно повторно
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelOAuth}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '6px',
                            backgroundColor: 'transparent',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-text-muted)',
                            fontSize: '11px',
                            cursor: 'pointer',
                          }}
                        >
                          Отмена
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: OAuth Token (Cookie) */}
              {activeTab === 'token' && (
                <form onSubmit={handleManualLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                    Прямой вход по <code>oauth_token</code> из cookie soundcloud.com. Предоставляет полные права на синхронизацию приватных лайков и плейлистов.
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
                      Значение oauth_token (из куки)
                    </label>
                    <input 
                      type="text"
                      placeholder="2-29384-..."
                      value={tokenInput}
                      onChange={(e) => setTokenInput(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: 'var(--radius-control)',
                        backgroundColor: 'var(--color-bg-base)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text-primary)',
                        fontSize: '13px',
                        outline: 'none',
                        fontFamily: 'monospace',
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !tokenInput.trim()}
                    className="btn-interactive"
                    style={{
                      marginTop: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '12px 18px',
                      borderRadius: 'var(--radius-control)',
                      background: 'linear-gradient(135deg, #ff5500 0%, #ff2200 100%)',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: (loading || !tokenInput.trim()) ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 14px rgba(255, 85, 0, 0.35)',
                    }}
                  >
                    {loading ? <RefreshCw size={15} className="animate-spin" /> : <LogIn size={15} />}
                    <span>{loading ? 'Проверка токена...' : 'Войти и Сохранить'}</span>
                  </button>
                </form>
              )}

              {/* Persistence Notice */}
              <div 
                style={{
                  marginTop: '20px',
                  paddingTop: '16px',
                  borderTop: '1px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '11px',
                  color: 'var(--color-text-muted)',
                }}
              >
                <ShieldCheck size={15} style={{ color: '#10b981' }} />
                <span>Аккаунт сохраняется в постоянной памяти (IndexedDB + LocalStorage)</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
