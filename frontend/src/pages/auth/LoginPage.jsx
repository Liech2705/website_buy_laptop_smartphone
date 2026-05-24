import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle, Zap, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingOverlay from '../../components/LoadingOverlay';

const LoginPage = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const { login, loading, authError, clearError } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from = location.state?.from
    ? `${location.state.from.pathname}${location.state.from.search || ''}${location.state.from.hash || ''}`
    : '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    const result = await login(email, password);
    if (result.success) {
      navigate(from, { replace: true });
    } else if (result.emailNotVerified) {
      // Chuyển sang trang xác minh email
      navigate(`/auth/verify-account?email=${encodeURIComponent(result.email)}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {loading && <LoadingOverlay message="Đang xác thực..." />}
      
      {/* Background Layering */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary-600/10 rounded-full blur-[150px] -mr-40 -mt-40" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent-600/5 rounded-full blur-[120px] -ml-20 -mb-20" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5" />

      <div className="relative w-full max-w-lg">
        {/* Decorative elements around card */}
        <div className="absolute -top-6 -right-6 w-20 h-20 bg-primary-500/20 rounded-full blur-2xl animate-pulse" />
        
        {/* Main Card */}
        <div className="bg-surface-100/40 backdrop-blur-3xl border border-surface-200/50 rounded-[40px] p-10 md:p-14 shadow-2xl relative overflow-hidden group">
          
          {/* Internal Glow */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-500/40 to-transparent" />

          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center mb-10">
            <Link to="/" className="inline-block group/logo mb-4">
               <div className="flex flex-col">
                  <span className="text-4xl font-black bg-gradient-to-r from-white via-primary-400 to-white bg-clip-text text-transparent uppercase italic tracking-tighter leading-none">
                    Liechtop
                  </span>
                  <p className="text-[10px] font-black tracking-[0.4em] text-primary-500 uppercase mt-1">Next Gen Identity</p>
               </div>
            </Link>
            <h2 className="text-xl font-black text-surface-900 uppercase tracking-tight">Chào mừng quay trở lại</h2>
            <p className="text-surface-500 text-xs font-bold uppercase tracking-widest mt-2">Dẫn đầu xu hướng công nghệ</p>
          </div>

          {/* Error Message */}
          {authError && (
            <div className="mb-8 flex items-center gap-4 bg-red-950/30 border border-red-500/30 text-red-400 rounded-2xl p-5 text-sm animate-[shake_0.4s_ease-in-out]">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="font-bold uppercase tracking-tight">{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-surface-500 uppercase tracking-[0.2em] ml-2">Tài khoản Email</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-surface-400 group-focus-within:text-primary-400 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="your@identity.com"
                  className="w-full pl-14 pr-6 py-4 bg-surface-200/50 border border-surface-300/50 text-surface-900 placeholder-surface-600 rounded-[20px] focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:bg-surface-200 transition-all font-bold"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-surface-500 uppercase tracking-[0.2em] ml-2">Mật bảo mật</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-surface-400 group-focus-within:text-primary-400 transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  id="login-password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-14 pr-14 py-4 bg-surface-200/50 border border-surface-300/50 text-surface-900 placeholder-surface-600 rounded-[20px] focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:bg-surface-200 transition-all font-bold"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPw(p => !p)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-white transition-colors"
                >
                  {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Forgot PW Placeholder */}
            <div className="flex justify-end pt-1">
               <Link to="/auth/forgot-password" className="text-[10px] font-black text-surface-500 uppercase tracking-widest hover:text-primary-400 transition-colors">Quên mật khẩu?</Link>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 space-y-4">
              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-primary-600 hover:bg-primary-700 text-white font-black rounded-[25px] transition-all shadow-xl shadow-primary-900/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
              >
                {loading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                    Đang xác thực
                  </div>
                ) : (
                  <>Truy cập ngay <ArrowRight className="w-5 h-5" /></>
                )}
              </button>
              
              <div className="flex items-center justify-center gap-4 py-2 opacity-30 grayscale underline-offset-4">
                 <ShieldCheck className="w-4 h-4 text-white" />
                 <span className="text-[9px] font-black text-white uppercase tracking-[0.3em]">Identity Verified SSL</span>
              </div>
            </div>
          </form>

          {/* Footer of Card */}
          <div className="mt-10 text-center space-y-6">
            <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="text-primary-400 hover:text-white transition-colors border-b-2 border-primary-400/20 pb-0.5 ml-1">Tạo mới ngay</Link>
            </p>
            
            <Link to="/" className="inline-flex items-center gap-2 text-[10px] font-black text-surface-500 hover:text-surface-900 transition-colors group">
              <Zap className="w-3 h-3 group-hover:scale-125 transition-transform" /> QUAY LẠI TRANG CHỦ
            </Link>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-5px); }
          40%, 80% { transform: translateX(5px); }
        }
      `}} />
    </div>
  );
};

export default LoginPage;
