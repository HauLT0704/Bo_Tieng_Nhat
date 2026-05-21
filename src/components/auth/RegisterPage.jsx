import React, { useState, useCallback } from 'react';
import { UserPlus, Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, User, Phone, Check, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { isUsernameTaken } from '../../firebase/firestoreService';

// Vietnamese phone regex: 0[3|5|7|8|9]xxxxxxxx or 84[3|5|7|8|9]xxxxxxxx
const VN_PHONE_REGEX = /^(0|\+?84)(3[2-9]|5[25689]|7[06-9]|8[1-9]|9[0-9])\d{7}$/;

export const RegisterPage = ({ onSwitchToLogin }) => {
  const { signup, loginWithGoogle, authError, setAuthError } = useAuth();

  const [formData, setFormData] = useState({
    displayName: '',
    username: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [step, setStep] = useState(1); // Multi-step form

  // Debounced username check
  const usernameCheckTimeout = React.useRef(null);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field-specific error
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Live username check
    if (field === 'username') {
      setUsernameAvailable(null);
      if (usernameCheckTimeout.current) clearTimeout(usernameCheckTimeout.current);
      
      if (value.trim().length >= 3) {
        setUsernameChecking(true);
        usernameCheckTimeout.current = setTimeout(async () => {
          try {
            const taken = await isUsernameTaken(value.trim().toLowerCase());
            setUsernameAvailable(!taken);
          } catch {
            setUsernameAvailable(null);
          }
          setUsernameChecking(false);
        }, 600);
      }
    }
  };

  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Vui lòng nhập tên hiển thị';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Vui lòng nhập tên tài khoản';
    } else if (formData.username.trim().length < 3) {
      newErrors.username = 'Tên tài khoản tối thiểu 3 ký tự';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username.trim())) {
      newErrors.username = 'Chỉ được dùng chữ cái, số và dấu gạch dưới';
    } else if (usernameAvailable === false) {
      newErrors.username = 'Tên tài khoản đã được sử dụng';
    }

    if (formData.phone.trim() && !VN_PHONE_REGEX.test(formData.phone.trim().replace(/\s+/g, ''))) {
      newErrors.phone = 'Số điện thoại VN không hợp lệ (VD: 0912345678)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Mật khẩu tối thiểu 8 ký tự';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError(null);

    if (!validateStep2()) return;

    setLoading(true);
    try {
      await signup(formData.email.trim(), formData.password, {
        displayName: formData.displayName.trim(),
        username: formData.username.trim().toLowerCase(),
        phone: formData.phone.trim().replace(/\s+/g, ''),
      });
    } catch (err) {
      setErrors(prev => ({ ...prev, form: err.message }));
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setAuthError(null);
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      setErrors(prev => ({ ...prev, form: err.message }));
    }
    setGoogleLoading(false);
  };

  const formError = errors.form || authError;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" id="register-page">
      {/* Animated Background */}
      <div className="auth-bg-gradient" />
      <div className="auth-floating-shapes">
        <div className="auth-shape auth-shape-1">ア</div>
        <div className="auth-shape auth-shape-2">カ</div>
        <div className="auth-shape auth-shape-3">サ</div>
        <div className="auth-shape auth-shape-4">タ</div>
        <div className="auth-shape auth-shape-5">ナ</div>
        <div className="auth-shape auth-shape-6">ハ</div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-emerald-500 shadow-2xl shadow-emerald-500/30 mb-4 floating-element">
            <span className="text-4xl">🥑</span>
          </div>
          <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">
            Tạo Tài Khoản
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1 font-medium">
            Bắt đầu hành trình chinh phục tiếng Nhật
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
            step === 1 
              ? 'bg-[var(--bg-accent)] text-[var(--text-inverse)] shadow-lg' 
              : 'bg-emerald-500/20 text-emerald-600'
          }`}>
            {step > 1 ? <Check size={14} /> : <span>1</span>}
            <span>Thông tin</span>
          </div>
          <div className="w-8 h-0.5 bg-[var(--border-color)]" />
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
            step === 2 
              ? 'bg-[var(--bg-accent)] text-[var(--text-inverse)] shadow-lg' 
              : 'bg-[var(--bg-primary)] text-[var(--text-secondary)] border border-[var(--border-color)]'
          }`}>
            <span>2</span>
            <span>Bảo mật</span>
          </div>
        </div>

        {/* Form Card */}
        <div className="auth-card">
          {/* Global Error */}
          {formError && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-sm font-medium mb-5 animate-shake">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {step === 1 ? (
            /* STEP 1: Profile Info */
            <div className="space-y-4">
              {/* Display Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  Tên hiển thị <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                  <input
                    id="register-displayname"
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => handleChange('displayName', e.target.value)}
                    placeholder="Tên của bạn"
                    className={`auth-input pl-11 ${errors.displayName ? 'border-red-500' : ''}`}
                    maxLength={30}
                  />
                </div>
                {errors.displayName && <p className="text-xs text-red-500 font-medium">{errors.displayName}</p>}
              </div>

              {/* Username */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  Tên tài khoản <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] text-sm font-bold">@</span>
                  <input
                    id="register-username"
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleChange('username', e.target.value.toLowerCase())}
                    placeholder="ten_tai_khoan"
                    className={`auth-input pl-11 pr-12 ${errors.username ? 'border-red-500' : ''} ${usernameAvailable === true ? 'border-emerald-500' : ''}`}
                    maxLength={20}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {usernameChecking && <Loader2 size={16} className="animate-spin text-[var(--text-secondary)]" />}
                    {!usernameChecking && usernameAvailable === true && <Check size={16} className="text-emerald-500" />}
                    {!usernameChecking && usernameAvailable === false && <X size={16} className="text-red-500" />}
                  </div>
                </div>
                {errors.username && <p className="text-xs text-red-500 font-medium">{errors.username}</p>}
                {!errors.username && usernameAvailable === true && (
                  <p className="text-xs text-emerald-500 font-medium">✓ Tên tài khoản khả dụng</p>
                )}
              </div>

              {/* Phone (optional) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  Số điện thoại <span className="text-[var(--text-secondary)] opacity-50">(tùy chọn)</span>
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                  <input
                    id="register-phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="0912 345 678"
                    className={`auth-input pl-11 ${errors.phone ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.phone && <p className="text-xs text-red-500 font-medium">{errors.phone}</p>}
              </div>

              <button
                id="register-next"
                type="button"
                onClick={handleNextStep}
                className="auth-btn-primary w-full mt-2"
              >
                <span>Tiếp tục</span>
                <span>→</span>
              </button>
            </div>
          ) : (
            /* STEP 2: Security */
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                  <input
                    id="register-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="email@example.com"
                    className={`auth-input pl-11 ${errors.email ? 'border-red-500' : ''}`}
                    autoComplete="email"
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500 font-medium">{errors.email}</p>}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                  <input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    placeholder="Tối thiểu 8 ký tự"
                    className={`auth-input pl-11 pr-12 ${errors.password ? 'border-red-500' : ''}`}
                    autoComplete="new-password"
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
                {errors.password && <p className="text-xs text-red-500 font-medium">{errors.password}</p>}
                {/* Password strength indicator */}
                {formData.password && (
                  <div className="flex gap-1 mt-2">
                    {[1, 2, 3, 4].map(i => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          formData.password.length >= i * 3
                            ? formData.password.length >= 12 ? 'bg-emerald-500' : formData.password.length >= 8 ? 'bg-amber-500' : 'bg-red-500'
                            : 'bg-[var(--border-color)]'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  Xác nhận mật khẩu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                  <input
                    id="register-confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    placeholder="Nhập lại mật khẩu"
                    className={`auth-input pl-11 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                    autoComplete="new-password"
                  />
                  {formData.confirmPassword && formData.password === formData.confirmPassword && (
                    <Check size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500" />
                  )}
                </div>
                {errors.confirmPassword && <p className="text-xs text-red-500 font-medium">{errors.confirmPassword}</p>}
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="auth-btn-secondary flex-1"
                >
                  ← Quay lại
                </button>
                <button
                  id="register-submit"
                  type="submit"
                  disabled={loading}
                  className="auth-btn-primary flex-[2]"
                >
                  {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <UserPlus size={18} />
                  )}
                  <span>{loading ? 'Đang tạo...' : 'Tạo Tài Khoản'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Divider */}
          <div className="relative flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-[var(--border-color)]" />
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase">hoặc</span>
            <div className="flex-1 h-px bg-[var(--border-color)]" />
          </div>

          {/* Google Login */}
          <button
            id="register-google"
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
            <span>{googleLoading ? 'Đang kết nối...' : 'Đăng ký bằng Google'}</span>
          </button>

          {/* Switch to Login */}
          <div className="mt-6 pt-6 border-t border-[var(--border-color)] text-center">
            <p className="text-sm text-[var(--text-secondary)]">
              Đã có tài khoản?{' '}
              <button
                id="switch-to-login"
                onClick={onSwitchToLogin}
                className="text-[var(--bg-accent)] font-bold hover:underline transition-all"
              >
                Đăng nhập
              </button>
            </p>
          </div>
        </div>

        <p className="text-center text-[10px] text-[var(--text-secondary)] mt-6 opacity-60 font-medium">
          © {new Date().getFullYear()} Bơ Tiếng Nhật. Cùng nhau học tập mỗi ngày.
        </p>
      </div>
    </div>
  );
};
