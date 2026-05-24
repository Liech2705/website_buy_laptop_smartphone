import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { changePassword } from '../../../services/userApi';

const ChangePassword = () => {
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (form.newPassword !== form.confirmPassword) {
      return toast.error('Mật khẩu xác nhận không khớp');
    }

    if (form.newPassword.length < 6) {
      return toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
    }

    setLoading(true);
    try {
      await changePassword(form);
      toast.success('Đổi mật khẩu thành công');
      setForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      const msg = error.response?.data?.message || 'Đã xảy ra lỗi khi đổi mật khẩu';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ label, name, value, show, setShow, placeholder }) => (
    <div className="space-y-2">
      <label className="text-sm font-bold text-surface-400 ml-1">{label}</label>
      <div className="relative group">
        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400 group-focus-within:text-primary-500 transition-colors" />
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => setForm({ ...form, [name]: e.target.value })}
          placeholder={placeholder}
          className="w-full pl-12 pr-12 py-3.5 rounded-2xl bg-surface-200/50 border border-surface-300 text-surface-900 outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
          required
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 hover:text-primary-400 transition-colors"
        >
          {show ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-surface-100 rounded-[2.5rem] p-8 border border-surface-200/50 shadow-2xl relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-500/10 rounded-full blur-[80px]" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-primary-600/10 rounded-full blur-[80px]" />

        <div className="relative">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-4 bg-primary-500/10 rounded-2xl">
              <ShieldCheck className="w-8 h-8 text-primary-500" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-surface-900 tracking-tight">Đổi mật khẩu</h1>
              <p className="text-surface-500 font-medium">Bảo vệ tài khoản của bạn bằng mật khẩu mạnh</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <InputField
              label="Mật khẩu hiện tại"
              name="currentPassword"
              value={form.currentPassword}
              show={showCurrent}
              setShow={setShowCurrent}
              placeholder="Nhập mật khẩu hiện tại"
            />

            <div className="h-px bg-surface-200/50 my-2" />

            <InputField
              label="Mật khẩu mới"
              name="newPassword"
              value={form.newPassword}
              show={showNew}
              setShow={setShowNew}
              placeholder="Ít nhất 6 ký tự"
            />

            <InputField
              label="Xác nhận mật khẩu mới"
              name="confirmPassword"
              value={form.confirmPassword}
              show={showConfirm}
              setShow={setShowConfirm}
              placeholder="Nhập lại mật khẩu mới"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-primary-600 hover:bg-primary-500 disabled:bg-surface-300 text-white py-4 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary-900/20 active:scale-[0.98]"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Cập nhật mật khẩu</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
