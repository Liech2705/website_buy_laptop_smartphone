import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPassword } from '../../services/authApi';
import { toast } from 'react-hot-toast';
import { Mail, ArrowLeft, Loader2, Send } from 'lucide-react';
import LoadingOverlay from '../../components/LoadingOverlay';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Vui lòng nhập email');

    setLoading(true);
    try {
      await forgotPassword(email);
      toast.success('Mã OTP đã được gửi đến email của bạn');
      setIsSent(true);
      // Chuyển sang trang nhập OTP sau 2s
      setTimeout(() => {
        navigate(`/auth/reset-password?email=${encodeURIComponent(email)}`);
      }, 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {loading && <LoadingOverlay message="Đang gửi mã xác thực..." />}
      
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

          <Link to="/login" className="inline-flex items-center gap-2 text-surface-500 hover:text-surface-900 transition-colors mb-6 text-sm font-bold group/link">
            <ArrowLeft className="w-4 h-4 group-hover/link:-translate-x-1 transition-transform" />
            Quay lại đăng nhập
          </Link>

          <div className="space-y-2 mb-8">
            <h1 className="text-3xl font-black text-surface-900 tracking-tight">Quên mật khẩu?</h1>
            <p className="text-surface-500 font-medium">Đừng lo, hãy nhập email của bạn để nhận mã xác thực OTP đặt lại mật khẩu.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-surface-500 uppercase tracking-[0.2em] ml-2">Địa chỉ Email</label>
              <div className="relative group/input">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-surface-400 group-focus-within/input:text-primary-400 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  disabled={loading || isSent}
                  className="w-full pl-14 pr-6 py-4 bg-surface-200/50 border border-surface-300/50 text-surface-900 placeholder-surface-600 rounded-[20px] focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:bg-surface-200 transition-all font-bold disabled:opacity-50"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || isSent}
              className="w-full flex items-center justify-center gap-3 py-5 bg-primary-600 hover:bg-primary-700 text-white rounded-[25px] font-black text-sm uppercase tracking-widest transition-all active:scale-[0.98] shadow-xl shadow-primary-900/30 disabled:opacity-70 disabled:cursor-not-allowed group/btn"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                  Đang xử lý
                </div>
              ) : isSent ? (
                'ĐÃ GỬI MÃ OTP'
              ) : (
                <>
                  GỬI MÃ XÁC THỰC
                  <Send className="w-4 h-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="text-primary-400 hover:text-surface-900 transition-colors border-b-2 border-primary-400/20 pb-0.5 ml-1">
                Tạo mới ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
