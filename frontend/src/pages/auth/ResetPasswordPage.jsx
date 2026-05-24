import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { resetPassword } from '../../services/authApi';
import { toast } from 'react-hot-toast';
import { KeyRound, ShieldCheck, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import LoadingOverlay from '../../components/LoadingOverlay';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const emailParam = searchParams.get('email') || '';

  const [formData, setFormData] = useState({
    email: emailParam,
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!emailParam) {
      toast.error('Thông tin không hợp lệ');
      navigate('/auth/forgot-password');
    }
  }, [emailParam, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.otp.length !== 6) return toast.error('Mã OTP phải có 6 chữ số');
    if (formData.newPassword.length < 6) return toast.error('Mật khẩu phải từ 6 ký tự');
    if (formData.newPassword !== formData.confirmPassword) return toast.error('Mật khẩu nhập lại không khớp');

    setLoading(true);
    try {
      await resetPassword({
        email: formData.email,
        otp: formData.otp,
        newPassword: formData.newPassword
      });
      toast.success('Đổi mật khẩu thành công!');
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng kiểm tra lại mã OTP');
    } finally {
      setLoading(false);
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
              <h1 className="text-3xl font-black text-surface-900">Thành công!</h1>
              <p className="text-surface-500 font-medium">Mật khẩu của bạn đã được thay đổi. Đang chuyển hướng về trang đăng nhập...</p>
            </div>
            <Link to="/login" className="block w-full py-5 bg-primary-600 hover:bg-primary-700 text-white rounded-[25px] font-black text-sm uppercase tracking-widest transition-all">
              ĐĂNG NHẬP NGAY
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {loading && <LoadingOverlay message="Đang cập nhật mật khẩu..." />}
      
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

          <Link to="/auth/forgot-password" className="inline-flex items-center gap-2 text-surface-500 hover:text-surface-900 transition-colors mb-6 text-sm font-bold group/link">
            <ArrowLeft className="w-4 h-4 group-hover/link:-translate-x-1 transition-transform" />
            Quay lại
          </Link>

          <div className="space-y-2 mb-8">
            <h1 className="text-3xl font-black text-surface-900 tracking-tight">Đặt lại mật khẩu</h1>
            <p className="text-surface-500 font-medium">Vui lòng nhập mã OTP được gửi tới <b>{formData.email}</b> và mật khẩu mới.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-surface-500 uppercase tracking-[0.2em] ml-2">Mã xác thực OTP</label>
              <div className="relative group/input">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-surface-400 group-focus-within/input:text-primary-400 transition-colors">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  maxLength={6}
                  value={formData.otp}
                  onChange={(e) => setFormData(p => ({ ...p, otp: e.target.value.replace(/\D/g, '') }))}
                  placeholder="000000"
                  className="w-full pl-14 pr-6 py-4 bg-surface-200/50 border border-surface-300/50 text-surface-900 placeholder-surface-600 rounded-[20px] focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:bg-surface-200 transition-all font-black text-center tracking-[0.5em] text-xl"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-surface-500 uppercase tracking-[0.2em] ml-2">Mật khẩu mới</label>
              <div className="relative group/input">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-surface-400 group-focus-within/input:text-primary-400 transition-colors">
                  <KeyRound className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData(p => ({ ...p, newPassword: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full pl-14 pr-6 py-4 bg-surface-200/50 border border-surface-300/50 text-surface-900 placeholder-surface-600 rounded-[20px] focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:bg-surface-200 transition-all font-bold"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-surface-500 uppercase tracking-[0.2em] ml-2">Xác nhận mật khẩu</label>
              <div className="relative group/input">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-surface-400 group-focus-within/input:text-primary-400 transition-colors">
                  <KeyRound className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(p => ({ ...p, confirmPassword: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full pl-14 pr-6 py-4 bg-surface-200/50 border border-surface-300/50 text-surface-900 placeholder-surface-600 rounded-[20px] focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:bg-surface-200 transition-all font-bold"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-5 bg-primary-600 hover:bg-primary-700 text-white rounded-[25px] font-black text-sm uppercase tracking-widest transition-all active:scale-[0.98] shadow-xl shadow-primary-900/30 disabled:opacity-70 mt-6"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                    Đang thiết lập
                </div>
              ) : 'XÁC NHẬN ĐỔI MẬT KHẨU'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
