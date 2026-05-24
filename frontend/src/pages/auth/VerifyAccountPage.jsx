import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { verifyAccount, resendVerification } from '../../services/authApi';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { ShieldCheck, Loader2, ArrowLeft, CheckCircle2, RefreshCw, Mail } from 'lucide-react';
import LoadingOverlay from '../../components/LoadingOverlay';

export default function VerifyAccountPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { saveSession } = useAuth();
  const emailParam = searchParams.get('email') || '';

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!emailParam) {
      toast.error('Thông tin không hợp lệ');
      navigate('/register');
    }
  }, [emailParam, navigate]);

  // Countdown cho nút gửi lại OTP
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return toast.error('Mã OTP phải có 6 chữ số');

    setLoading(true);
    try {
      await verifyAccount({ email: emailParam, otp });
      toast.success('Tài khoản đã được xác minh! Đang chuyển đến đăng nhập...');
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Mã OTP không đúng hoặc đã hết hạn');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setResending(true);
    try {
      await resendVerification(emailParam);
      toast.success('Mã OTP mới đã được gửi! Kiểm tra email của bạn.');
      setCountdown(60); // Chờ 60s trước khi gửi lại
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể gửi lại mã, vui lòng thử lại');
    } finally {
      setResending(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center px-4 py-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-green-600/10 rounded-full blur-[150px] -mr-40 -mt-40" />
        <div className="relative w-full max-w-lg">
          <div className="bg-surface-100/40 backdrop-blur-3xl border border-surface-200/50 rounded-[40px] p-14 shadow-2xl text-center space-y-6">
            <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border-2 border-green-500/30">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-black text-surface-900">Xác minh thành công!</h1>
              <p className="text-surface-500 font-medium">Tài khoản của bạn đã được kích hoạt. Đang chuyển hướng đến trang đăng nhập...</p>
            </div>
            <Link to="/login" className="block w-full py-5 bg-green-600 hover:bg-green-700 text-white rounded-[25px] font-black text-sm uppercase tracking-widest transition-all">
              ĐĂNG NHẬP NGAY
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {loading && <LoadingOverlay message="Đang xác minh..." />}
      {resending && <LoadingOverlay message="Đang gửi lại mã..." />}

      {/* Background Layering */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary-600/10 rounded-full blur-[150px] -mr-40 -mt-40" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent-600/5 rounded-full blur-[120px] -ml-20 -mb-20" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5" />

      <div className="relative w-full max-w-lg">
        <div className="absolute -top-6 -right-6 w-20 h-20 bg-primary-500/20 rounded-full blur-2xl animate-pulse" />
        
        <div className="bg-surface-100/40 backdrop-blur-3xl border border-surface-200/50 rounded-[40px] p-10 md:p-14 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500/40 to-transparent" />

          <Link to="/register" className="inline-flex items-center gap-2 text-surface-500 hover:text-surface-900 transition-colors mb-6 text-sm font-bold group/link">
            <ArrowLeft className="w-4 h-4 group-hover/link:-translate-x-1 transition-transform" />
            Quay lại đăng ký
          </Link>

          {/* Header */}
          <div className="space-y-3 mb-8">
            <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center border border-green-500/20">
              <Mail className="w-7 h-7 text-green-500" />
            </div>
            <h1 className="text-3xl font-black text-surface-900 tracking-tight">Xác minh tài khoản</h1>
            <p className="text-surface-500 font-medium">
              Chúng tôi đã gửi mã OTP đến <br/>
              <b className="text-surface-900">{emailParam}</b>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-surface-500 uppercase tracking-[0.2em] ml-2">Mã xác minh OTP</label>
              <div className="relative group/input">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-surface-400 group-focus-within/input:text-green-500 transition-colors">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full pl-14 pr-6 py-4 bg-surface-200/50 border border-surface-300/50 text-surface-900 placeholder-surface-600 rounded-[20px] focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:bg-surface-200 transition-all font-black text-center tracking-[0.5em] text-xl"
                  required
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-5 bg-green-600 hover:bg-green-700 text-white rounded-[25px] font-black text-sm uppercase tracking-widest transition-all active:scale-[0.98] shadow-xl shadow-green-900/30 disabled:opacity-70"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                  Đang xác minh
                </div>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  XÁC MINH TÀI KHOẢN
                </>
              )}
            </button>
          </form>

          {/* Gửi lại OTP */}
          <div className="mt-8 text-center">
            <p className="text-surface-500 text-sm font-medium mb-3">Không nhận được email?</p>
            <button
              onClick={handleResend}
              disabled={resending || countdown > 0}
              className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 font-black text-sm uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
              {countdown > 0 ? `Gửi lại sau ${countdown}s` : resending ? 'Đang gửi...' : 'Gửi lại mã OTP'}
            </button>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest">
              Đã có tài khoản?{' '}
              <Link to="/login" className="text-primary-400 hover:text-surface-900 transition-colors border-b-2 border-primary-400/20 pb-0.5 ml-1">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
