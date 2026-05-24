import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getVoucherById, updateVoucher, getAllUsers } from '../../../services/adminApi';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft, Save, Tag, Percent, Calendar, Users, 
  Settings2, Sparkles, AlertCircle, CheckCircle2, 
  Clock, CreditCard, Loader2, Info, UserPlus
} from 'lucide-react';

export default function VoucherEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [searchUser, setSearchUser] = useState('');
  
  const [form, setForm] = useState({
    code: '',
    discountType: 'Percentage',
    discountValue: '',
    maxDiscountAmount: '',
    minOrderAmount: '',
    usageLimit: '',
    perUserLimit: 1,
    startDate: '',
    expiryDate: '',
    isActive: true,
    targetUserIds: []
  });

  useEffect(() => {
    Promise.all([getVoucherById(id), getAllUsers(1, 100)])
      .then(([v, userRes]) => {
        setForm({
          code: v.code,
          discountType: v.discountPercentage ? 'Percentage' : 'Fixed',
          discountValue: v.discountPercentage || v.discountAmount || '',
          maxDiscountAmount: v.maxDiscountAmount || '',
          minOrderAmount: v.minOrderAmount || '',
          usageLimit: v.usageLimit || '',
          perUserLimit: v.usageLimitPerUser || 1,
          startDate: v.startDate ? v.startDate.split('Z')[0] : '',
          expiryDate: v.expiryDate ? v.expiryDate.split('Z')[0] : '',
          isActive: v.isActive,
          targetUserIds: v.assignedUserIds || []
        });
        setUsers(userRes.data || []);
      })
      .catch(() => toast.error('Lỗi tải dữ liệu'))
      .finally(() => setFetching(false));
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const toggleUserSelection = (userId) => {
    setForm(p => {
      const exists = p.targetUserIds.includes(userId);
      return {
        ...p,
        targetUserIds: exists ? p.targetUserIds.filter(uid => uid !== userId) : [...p.targetUserIds, userId]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dto = {
        code: form.code.toUpperCase(),
        discountPercentage: form.discountType === 'Percentage' ? parseFloat(form.discountValue) : null,
        discountAmount: form.discountType === 'Fixed' ? parseFloat(form.discountValue) : null,
        maxDiscountAmount: form.maxDiscountAmount ? parseFloat(form.maxDiscountAmount) : null,
        minOrderAmount: parseFloat(form.minOrderAmount) || 0,
        usageLimit: form.usageLimit ? parseInt(form.usageLimit) : null,
        usageLimitPerUser: parseInt(form.perUserLimit) || 1,
        startDate: form.startDate || null,
        expiryDate: form.expiryDate || null,
        isActive: form.isActive,
        assignedUserIds: form.targetUserIds.length > 0 ? form.targetUserIds : null
      };
      await updateVoucher(id, dto);
      toast.success('Cập nhật Voucher thành công!');
      navigate('/admin/vouchers');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi cập nhật');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.fullName?.toLowerCase().includes(searchUser.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchUser.toLowerCase())
  );

  if (fetching) return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Decrypting voucher data...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 pb-20 animate-in fade-in duration-700">
      <div className="max-w-6xl mx-auto space-y-10 pt-10 px-4">
        
        {/* ULTRA PREMIUM HEADER */}
        <div className="relative group overflow-hidden bg-white/[0.03] backdrop-blur-3xl p-10 rounded-[40px] border border-white/10 shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/10 rounded-full blur-[120px] -mr-48 -mt-48" />
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-8">
                    <button onClick={() => navigate('/admin/vouchers')} className="p-5 bg-white/5 hover:bg-primary-600 text-white rounded-[24px] transition-all shadow-xl active:scale-90 border border-white/5">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Sparkles className="w-4 h-4 text-primary-400 animate-pulse" />
                            <span className="text-[10px] font-black text-primary-400 uppercase tracking-[0.4em]">Campaign Optimization</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic leading-none">
                            Hiệu Chỉnh <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-indigo-400">Voucher</span>
                        </h1>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-4 flex items-center gap-2 italic">
                           ID: {id.split('-')[0]}... • Đang trong trạng thái chỉnh sửa
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
                <div className="bg-white/[0.03] backdrop-blur-xl rounded-[40px] border border-white/10 p-10 space-y-10 shadow-2xl">
                    <div className="flex items-center gap-4 pb-6 border-b border-white/5">
                        <Settings2 className="w-5 h-5 text-indigo-400" />
                        <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Thông số Chiến dịch</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <label className="admin-form-label ml-2">Mã định danh (CODE) *</label>
                            <input 
                                name="code" value={form.code} onChange={handleChange} required
                                className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-6 py-5 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-black tracking-[0.2em] uppercase text-lg"
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="admin-form-label ml-2">Loại hình</label>
                            <div className="grid grid-cols-2 gap-3 p-1 bg-slate-900/50 rounded-2xl border border-white/5">
                                <button type="button" onClick={() => setForm(p => ({...p, discountType: 'Percentage'}))}
                                    className={`py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${form.discountType === 'Percentage' ? 'bg-primary-600 text-white' : 'text-slate-500'}`}>
                                    Phần trăm (%)
                                </button>
                                <button type="button" onClick={() => setForm(p => ({...p, discountType: 'Fixed'}))}
                                    className={`py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${form.discountType === 'Fixed' ? 'bg-primary-600 text-white' : 'text-slate-500'}`}>
                                    Số tiền (đ)
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-4">
                            <label className="admin-form-label ml-2">Giá trị giảm *</label>
                            <input type="number" name="discountValue" value={form.discountValue} onChange={handleChange} required
                                className="admin-form-input !py-5 !bg-slate-900/50 !text-lg !font-black !text-primary-400" />
                        </div>
                        <div className="space-y-4">
                            <label className="admin-form-label ml-2">Giảm tối đa (đ)</label>
                            <input type="number" name="maxDiscountAmount" value={form.maxDiscountAmount} onChange={handleChange}
                                className="admin-form-input !py-5 !bg-slate-900/50 !font-bold" />
                        </div>
                        <div className="space-y-4">
                            <label className="admin-form-label ml-2">Đơn tối thiểu (đ)</label>
                            <input type="number" name="minOrderAmount" value={form.minOrderAmount} onChange={handleChange}
                                className="admin-form-input !py-5 !bg-slate-900/50 !font-bold" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white/[0.03] backdrop-blur-xl rounded-[40px] border border-white/10 p-10 space-y-8">
                        <div className="flex items-center gap-4 pb-4 border-b border-white/5">
                            <AlertCircle className="w-5 h-5 text-amber-400" />
                            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Quota sử dụng</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <label className="admin-form-label text-[10px]">Tổng lượt dùng</label>
                                <input type="number" name="usageLimit" value={form.usageLimit} onChange={handleChange}
                                    className="admin-form-input !bg-slate-900/50 !text-center !text-lg" />
                            </div>
                            <div className="space-y-4">
                                <label className="admin-form-label text-[10px]">Mỗi User</label>
                                <input type="number" name="perUserLimit" value={form.perUserLimit} onChange={handleChange}
                                    className="admin-form-input !bg-slate-900/50 !text-center !text-lg" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/[0.03] backdrop-blur-xl rounded-[40px] border border-white/10 p-10 space-y-8">
                        <div className="flex items-center gap-4 pb-4 border-b border-white/5">
                            <Calendar className="w-5 h-5 text-green-400" />
                            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Timeline</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <label className="admin-form-label text-[10px]">Bắt đầu</label>
                                <input type="datetime-local" name="startDate" value={form.startDate} onChange={handleChange}
                                    className="admin-form-input !bg-slate-900/50 !px-4 !text-[11px]" />
                            </div>
                            <div className="space-y-4">
                                <label className="admin-form-label text-[10px]">Kết thúc</label>
                                <input type="datetime-local" name="expiryDate" value={form.expiryDate} onChange={handleChange}
                                    className="admin-form-input !bg-slate-900/50 !px-4 !text-[11px]" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL: AUDIENCE SYNC */}
            <div className="lg:col-span-4 space-y-8">
                <div className="bg-white/[0.03] backdrop-blur-xl rounded-[40px] border border-white/10 p-8 space-y-8 h-full flex flex-col shadow-2xl">
                    <div className="flex items-center justify-between pb-6 border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <Users className="w-5 h-5 text-primary-400" />
                            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Audience Selection</h3>
                        </div>
                        <div className="px-3 py-1 bg-primary-600/20 text-primary-400 rounded-full text-[9px] font-black uppercase">
                            {form.targetUserIds.length > 0 ? `${form.targetUserIds.length} Targeted` : 'Public'}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <input 
                            type="text" placeholder="Filter users..." value={searchUser} onChange={e => setSearchUser(e.target.value)}
                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-primary-500 transition-all"
                        />

                        <div className="flex-1 overflow-y-auto max-h-[350px] pr-2 custom-scrollbar space-y-2">
                            {filteredUsers.map(user => (
                                <div 
                                    key={user.id} 
                                    onClick={() => toggleUserSelection(user.id)}
                                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                                        form.targetUserIds.includes(user.id) 
                                        ? 'bg-primary-600/20 border-primary-500/50' 
                                        : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-[10px] ${form.targetUserIds.includes(user.id) ? 'bg-primary-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                                            {user.fullName?.charAt(0) || 'U'}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[11px] font-black text-white truncate">{user.fullName || 'No Name'}</p>
                                            <p className="text-[9px] text-slate-500 truncate">{user.email}</p>
                                        </div>
                                    </div>
                                    {form.targetUserIds.includes(user.id) && <CheckCircle2 className="w-4 h-4 text-primary-400" />}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/5 mt-auto space-y-4">
                        <button type="submit" disabled={loading}
                            className="w-full py-5 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-black rounded-3xl transition-all shadow-[0_20px_40px_rgba(37,99,235,0.3)] active:scale-[0.98] flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs">
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            <span>{loading ? 'Updating...' : 'Cập nhật Voucher'}</span>
                        </button>
                        <button type="button" onClick={() => navigate('/admin/vouchers')}
                            className="w-full py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors">
                            Hủy bỏ thay đổi
                        </button>
                    </div>
                </div>
            </div>
        </form>
      </div>
    </div>
  );
}
