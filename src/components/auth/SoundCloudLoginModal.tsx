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
  Sparkles
} from 'lucide-react';
import { SoundCloudAuth, AuthStep } from '../../core/soundcloud/SoundCloudAuth';
import { SoundCloudUser } from '../../core/soundcloud/SoundCloudTypes';

interface SoundCloudLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const SoundCloudLoginModal: React.FC<SoundCloudLoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const auth = SoundCloudAuth.getInstance();
  const [tokenInput, setTokenInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<SoundCloudUser | null>(auth.getUser());
  const [oauthStep, setOauthStep] = useState<AuthStep>('idle');
  const [showManualInput, setShowManualInput] = useState(false);

  React.useEffect(() => {
    return auth.subscribe((u) => setUser(u));
  }, [auth]);

  if (!isOpen) return null;

  // 1-Click OAuth Login Flow
  const handleOAuthLogin = async () => {
    setError(null);
    setLoading(true);
    setOauthStep('opening');

    try {
      await auth.startOAuthLogin({
        onStepChange: (step) => {
          setOauthStep(step);
          if (step === 'completed') {
            setLoading(false);
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
          if (onSuccess) onSuccess();
        },
      });
    } catch (err: any) {
      setError(err?.message || 'Не удалось открыть авторизацию SoundCloud');
      setLoading(false);
      setOauthStep('failed');
    }
  };

  const handleCancelOAuth = () => {
    auth.cancelOAuthLogin();
    setOauthStep('idle');
    setLoading(false);
  };

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await auth.loginWithToken(tokenInput);
    setLoading(false);

    if (res.success) {
      setTokenInput('');
      if (onSuccess) onSuccess();
    } else {
      setError(res.error || 'Ошибка входа в SoundCloud');
    }
  };

  const handleLogout = () => {
    auth.logout();
    setUser(null);
    setError(null);
    setOauthStep('idle');
  };

  const handleRefresh = async () => {
    setLoading(true);
    await auth.refreshUser();
    setLoading(false);
    if (onSuccess) onSuccess();
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 80,
        backgroundColor: 'rgba(0, 0, 0, 0.82)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div 
        style={{
          width: '540px',
          maxWidth: '100%',
          backgroundColor: 'var(--color-bg-surface)',
          borderRadius: 'var(--radius-modal)',
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
            backgroundColor: 'var(--color-bg-base)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div 
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #ff5500 0%, #ff2200 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 14px rgba(255, 85, 0, 0.35)',
              }}
            >
              <Radio size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700 }}>SoundCloud Sync</h2>
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                Синхронизация вашей личной библиотеки с soundcloud.com
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', overflowY: 'auto' }}>
          {error && (
            <div 
              style={{
                padding: '12px 14px',
                borderRadius: '10px',
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#ef4444',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '18px',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {user ? (
            /* Logged in state */
            <div>
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '18px',
                  borderRadius: '16px',
                  backgroundColor: 'var(--color-bg-base)',
                  border: '1px solid var(--color-border)',
                  marginBottom: '20px',
                }}
              >
                <img 
                  src={user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200'}
                  alt={user.username}
                  style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '17px', fontWeight: 700 }}>{user.username}</span>
                    <span 
                      style={{
                        padding: '3px 9px',
                        borderRadius: '9999px',
                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                        color: '#10b981',
                        fontSize: '11px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <CheckCircle2 size={12} />
                      Подключено
                    </span>
                  </div>

                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '6px' }}>
                    Лайков: <strong>{user.likes_count ?? '—'}</strong> · Плейлистов: <strong>{user.playlist_count ?? '—'}</strong> · Подписчиков: <strong>{user.followers_count ?? '—'}</strong>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px 18px',
                    borderRadius: 'var(--radius-control)',
                    backgroundColor: '#ff5500',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(255, 85, 0, 0.3)',
                  }}
                >
                  <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                  <span>{loading ? 'Синхронизация...' : 'Синхронизировать сейчас'}</span>
                </button>

                <button
                  onClick={handleLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '12px 18px',
                    borderRadius: 'var(--radius-control)',
                    backgroundColor: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    color: '#ef4444',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <LogOut size={16} />
                  <span>Выйти</span>
                </button>
              </div>
            </div>
          ) : (
            /* Logged out state */
            <div>
              {/* Active OAuth Polling View */}
              {oauthStep !== 'idle' && oauthStep !== 'failed' ? (
                <div 
                  style={{
                    padding: '24px',
                    borderRadius: '16px',
                    backgroundColor: 'var(--color-bg-base)',
                    border: '1px solid var(--color-border)',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '14px',
                  }}
                >
                  <div 
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255, 85, 0, 0.15)',
                      color: '#ff5500',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <RefreshCw size={24} className="animate-spin" />
                  </div>

                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>
                      {oauthStep === 'opening' && 'Открываем окно авторизации SoundCloud...'}
                      {oauthStep === 'waiting' && 'Ожидание подтверждения входа...'}
                      {oauthStep === 'token' && 'Получение сессии SoundCloud...'}
                      {oauthStep === 'extract' && 'Загрузка профиля и треков...'}
                      {oauthStep === 'finalizing' && 'Синхронизация вашей медиатеки...'}
                    </h3>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.5', maxWidth: '360px' }}>
                      В открывшемся окне браузера нажмите кнопку <strong>«Connect with SoundCloud»</strong> или войдите в свой аккаунт.
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                    <button
                      onClick={() => auth.reopenAuthUrl()}
                      style={{
                        padding: '9px 16px',
                        borderRadius: 'var(--radius-control)',
                        backgroundColor: 'var(--color-bg-surface)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text-primary)',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <ExternalLink size={14} />
                      <span>Открыть окно повторно</span>
                    </button>

                    <button
                      onClick={handleCancelOAuth}
                      style={{
                        padding: '9px 16px',
                        borderRadius: 'var(--radius-control)',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text-secondary)',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              ) : (
                /* Primary 1-Click Login Screen */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <div 
                    style={{
                      padding: '20px',
                      borderRadius: '16px',
                      background: 'linear-gradient(145deg, rgba(255, 85, 0, 0.12) 0%, rgba(255, 85, 0, 0.03) 100%)',
                      border: '1px solid rgba(255, 85, 0, 0.25)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Sparkles size={16} color="#ff7700" />
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#ff7700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Вход в 1 клик
                      </span>
                    </div>

                    <p style={{ fontSize: '13px', color: 'var(--color-text-primary)', lineHeight: '1.5', marginBottom: '16px' }}>
                      Нажмите кнопку ниже, чтобы автоматически подключить ваш аккаунт <strong>SoundCloud</strong> и мгновенно синхронизировать <strong>избранное (Likes)</strong>, <strong>плейлисты</strong> и <strong>персональную ленту</strong>.
                    </p>

                    <button
                      onClick={handleOAuthLogin}
                      disabled={loading}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        padding: '13px 20px',
                        borderRadius: 'var(--radius-control)',
                        background: 'linear-gradient(135deg, #ff5500 0%, #ff2200 100%)',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: '14px',
                        fontWeight: 700,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        boxShadow: '0 4px 18px rgba(255, 85, 0, 0.4)',
                        transition: 'transform 0.15s ease',
                      }}
                    >
                      <Zap size={18} fill="currentColor" />
                      <span>{loading ? 'Подключение...' : 'Войти через SoundCloud (1 клик)'}</span>
                    </button>
                  </div>

                  {/* Manual Token Fallback Accordion */}
                  <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
                    <button
                      type="button"
                      onClick={() => setShowManualInput(!showManualInput)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-text-secondary)',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: 0,
                      }}
                    >
                      <KeyRound size={14} />
                      <span>{showManualInput ? 'Скрыть ручной ввод токена' : 'Альтернативный вход: ввести токен вручную'}</span>
                    </button>

                    {showManualInput && (
                      <form onSubmit={handleManualLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
                        <div style={{ position: 'relative' }}>
                          <input 
                            type="password"
                            value={tokenInput}
                            onChange={(e) => setTokenInput(e.target.value)}
                            placeholder="Вставьте oauth_token (начинается с 2-...)"
                            style={{
                              width: '100%',
                              padding: '10px 14px 10px 38px',
                              borderRadius: 'var(--radius-control)',
                              backgroundColor: 'var(--color-bg-base)',
                              border: '1px solid var(--color-border)',
                              color: 'var(--color-text-primary)',
                              fontSize: '13px',
                              outline: 'none',
                            }}
                          />
                          <KeyRound size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                        </div>

                        <button
                          type="submit"
                          disabled={loading || !tokenInput.trim()}
                          style={{
                            padding: '10px 16px',
                            borderRadius: 'var(--radius-control)',
                            backgroundColor: 'var(--color-bg-base)',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-text-primary)',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: loading || !tokenInput.trim() ? 'not-allowed' : 'pointer',
                            opacity: loading || !tokenInput.trim() ? 0.6 : 1,
                          }}
                        >
                          Подключить по токену
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
