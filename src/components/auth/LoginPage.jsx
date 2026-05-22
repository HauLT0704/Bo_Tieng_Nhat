import React, { useState, useEffect } from 'react';
import { LogIn, Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const LoginPage = ({ onSwitchToRegister, onCancel }) => {
  const { login, loginWithGoogle, authError, setAuthError } = useAuth();

  // Email login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  // Clear errors on mount
  useEffect(() => {
    setLocalError('');
    setAuthError(null);
  }, [setAuthError]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLocalError('');
    setAuthError(null);

    if (!email.trim()) {
      setLocalError('Vui lòng nhập email');
      return;
    }
    if (!password) {
      setLocalError('Vui lòng nhập mật khẩu');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setLocalError(err.message);
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLocalError('');
    setAuthError(null);
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      setLocalError(err.message);
    }
    setGoogleLoading(false);
  };

  const error = localError || authError;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" id="login-page">
      {/* Animated Background */}
      <div className="auth-bg-gradient" />
      <div className="auth-floating-shapes">
        <div className="auth-shape auth-shape-1">あ</div>
        <div className="auth-shape auth-shape-2">か</div>
        <div className="auth-shape auth-shape-3">さ</div>
        <div className="auth-shape auth-shape-4">た</div>
        <div className="auth-shape auth-shape-5">な</div>
        <div className="auth-shape auth-shape-6">は</div>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md relative z-10">
        {onCancel && (
          <button 
            onClick={onCancel} 
            className="absolute -top-3 -right-3 p-2 bg-[var(--bg-primary)] border-2 border-[var(--border-color)] rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--bg-accent)] transition-all z-20 shadow-lg"
          >
            <X size={18} />
          </button>
        )}
        
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-emerald-500 shadow-2xl shadow-emerald-500/30 mb-4 floating-element">
            <span className="text-4xl">🥑</span>
          </div>
          <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">
            Bơ Tiếng <span className="text-emerald-500">Nhật</span>
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1 font-medium">
            アボカド日本語 — Đăng nhập để tiếp tục học
          </p>
        </div>

        {/* Form Card */}
        <div className="auth-card">
          {/* Error Alert */}
          {error && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-sm font-medium animate-shake mb-5" id="login-error">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="auth-input pl-11"
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="auth-input pl-11 pr-12"
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading || googleLoading}
              className="auth-btn-primary w-full"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <LogIn size={18} />
              )}
              <span>{loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}</span>
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-[var(--border-color)]" />
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase">hoặc</span>
            <div className="flex-1 h-px bg-[var(--border-color)]" />
          </div>

          {/* Google Login */}
          <button
            id="login-google"
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading || googleLoading}
            className="auth-btn-google w-full"
          >
            {googleLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            <span>{googleLoading ? 'Đang kết nối...' : 'Đăng nhập bằng Google'}</span>
          </button>

          {/* Switch to Register */}
          <div className="mt-6 pt-6 border-t border-[var(--border-color)] text-center">
            <p className="text-sm text-[var(--text-secondary)]">
              Chưa có tài khoản?{' '}
              <button
                id="switch-to-register"
                onClick={onSwitchToRegister}
                className="text-[var(--bg-accent)] font-bold hover:underline transition-all"
              >
                Đăng ký ngay
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-[var(--text-secondary)] mt-6 opacity-60 font-medium">
          © {new Date().getFullYear()} Bơ Tiếng Nhật. Cùng nhau học tập mỗi ngày.
        </p>
      </div>
    </div>
  );
};
