import { useState, useEffect } from 'react';
import { Save, User, Phone, Mail, Calendar, UserCircle } from 'lucide-react';
import { getProfile, updateProfile } from '../../../services/userApi';
import { toast } from 'react-hot-toast';

const ProfileInfo = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    gender: '',
    dateOfBirth: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await getProfile();
      if (res) {
        setForm({
          fullName: res.fullName || '',
          email: res.email || '',
          phone: res.phone || '',
          gender: res.gender || '',
          dateOfBirth: res.dateOfBirth ? res.dateOfBirth.split('T')[0] : '',
        });
      }
    } catch (error) {
      toast.error('Không thể tải thông tin cá nhân');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate Phone: must be 10 digits and start with 0
    if (form.phone && !/^0[0-9]{9}$/.test(form.phone)) {
      return toast.error('Số điện thoại phải có 10 số và bắt đầu bằng số 0');
    }

    setSaving(true);
    try {
      const payload = {
        fullName: form.fullName,
        phone: form.phone || null,
        gender: form.gender || null,
        dateOfBirth: form.dateOfBirth || null, // Standard yyyy-MM-dd string works for DateTime? in .NET
      };
      await updateProfile(payload);
      toast.success('Cập nhật thông tin thành công');
    } catch (error) {
      if (error.response?.data?.errors) {
        // Display validation errors from ASP.NET Core (e.g., Phone, Date formatting)
        const errors = error.response.data.errors;
        Object.keys(errors).forEach(key => {
          errors[key].forEach(err => toast.error(`${key}: ${err}`));
        });
      } else {
        const msg = error.response?.data?.message || error.response?.data?.title || 'Cập nhật thất bại';
        toast.error(msg);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="bg-surface-100 rounded-3xl p-8 border border-surface-200/50 animate-pulse">
      <div className="h-8 bg-surface-200 rounded w-1/4 mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1,2,3,4].map(i => <div key={i} className="h-20 bg-surface-200 rounded-2xl" />)}
      </div>
    </div>
  );

  return (
    <div className="bg-surface-100 rounded-3xl p-8 border border-surface-200/50 shadow-xl shadow-black/10">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-primary-600/10 rounded-2xl text-primary-500">
          <UserCircle className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-surface-900">Hồ sơ cá nhân</h1>
          <p className="text-surface-500 text-sm">Quản lý thông tin tài khoản của bạn</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-surface-400 ml-1">Họ và tên</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400 group-focus-within:text-primary-500 transition-colors" />
              <input
                type="text"
                value={form.fullName}
                onChange={e => setForm({...form, fullName: e.target.value})}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-surface-200/50 border border-surface-300 text-surface-900 outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-surface-400 ml-1">Email (Không thể thay đổi)</label>
            <div className="relative opacity-60">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
              <input
                type="email"
                value={form.email}
                disabled
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-surface-200/50 border border-surface-300 text-surface-900 cursor-not-allowed font-medium"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-surface-400 ml-1">Số điện thoại (10 số, bắt đầu bằng 0)</label>
            <div className="relative group">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400 group-focus-within:text-primary-500 transition-colors" />
              <input
                type="tel"
                value={form.phone}
                onChange={e => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  if (val.length <= 10) {
                    if (val.length > 0 && val[0] !== '0') return; // Chặn ngay nếu số đầu không phải 0
                    setForm({...form, phone: val});
                  }
                }}
                placeholder="0xxxxxxxxx"
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-surface-200/50 border border-surface-300 text-surface-900 outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-surface-400 ml-1">Ngày sinh (Chọn từ lịch)</label>
            <div className="relative group">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400 group-focus-within:text-primary-500 transition-colors" />
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={e => setForm({...form, dateOfBirth: e.target.value})}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-surface-200/50 border border-surface-300 text-surface-900 outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium [color-scheme:dark]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-surface-400 ml-1">Giới tính</label>
            <div className="flex gap-4">
              {['Nam', 'Nữ', 'Khác'].map(g => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setForm({...form, gender: g})}
                  className={`flex-1 py-3.5 rounded-2xl border font-bold transition-all ${
                    form.gender === g
                      ? 'bg-primary-600/10 border-primary-500 text-primary-500 shadow-lg shadow-primary-900/10'
                      : 'bg-surface-200/50 border-surface-300 text-surface-600 hover:border-surface-400'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

        </div>

        <div className="pt-6 border-t border-surface-200/50 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-primary-900/20 active:scale-95 flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? 'Đang lưu...' : (
              <>
                <Save className="w-5 h-5" />
                Lưu thay đổi
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileInfo;
