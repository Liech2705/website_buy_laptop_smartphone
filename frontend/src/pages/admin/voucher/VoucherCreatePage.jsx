import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createVoucher, getAllUsers } from '../../../services/adminApi';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft, Save, Tag, Percent, Calendar, Users, 
  Settings2, Sparkles, AlertCircle, CheckCircle2, 
  Clock, CreditCard, Loader2, Info, LayoutGrid, UserPlus
} from 'lucide-react';

export default function VoucherCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [searchUser, setSearchUser] = useState('');
  
  const [form, setForm] = useState({
    code: '',
    discountType: 'Percentage', // Percentage, Fixed
    discountValue: '',
    maxDiscountAmount: '',
    minOrderAmount: '',
    usageLimit: '',
    perUserLimit: 1,
    startDate: '',
    expiryDate: '',
    isActive: true,
    targetUserIds: [] // Empty means for all
  });

  useEffect(() => {
    getAllUsers(1, 100).then(res => setUsers(res.data || [])).catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const toggleUserSelection = (userId) => {
    setForm(p => {
      const exists = p.targetUserIds.includes(userId);
      return {
        ...p,
        targetUserIds: exists ? p.targetUserIds.filter(id => id !== userId) : [...p.targetUserIds, userId]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.code.trim()) return toast.error('Mã không được để trống');
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
      await createVoucher(dto);
      toast.success('Đã tạo siêu Voucher!');
      navigate('/admin/vouchers');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi hệ thống');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.fullName?.toLowerCase().includes(searchUser.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchUser.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 pb-20 animate-in fade-in duration-700">
      <div className="max-w-6xl mx-auto space-y-10 pt-10 px-4">
        
        {/* ULTRA PREMIUM HEADER */}
        <div className="relative group overflow-hidden bg-white/[0.03] backdrop-blur-3xl p-10 rounded-[40px] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/10 rounded-full blur-[120px] -mr-48 -mt-48 group-hover:bg-primary-600/20 transition-all duration-1000" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[100px] -ml-32 -mb-32" />
            
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-8">
                    <button onClick={() => navigate('/admin/vouchers')} className="group/btn p-5 bg-white/5 hover:bg-primary-600 text-white rounded-[24px] transition-all shadow-xl active:scale-90 border border-white/5">
                        <ArrowLeft className="w-6 h-6 group-hover/btn:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Sparkles className="w-4 h-4 text-primary-400 animate-pulse" />
                            <span className="text-[10px] font-black text-primary-400 uppercase tracking-[0.4em]">Promotion Engineering</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic leading-none">
                            Tạo Mã <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-indigo-400">Ưu Đãi</span>
                        </h1>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-4 flex items-center gap-2">
                            <Clock className="w-3 h-3" /> Thiết lập chiến dịch giảm giá hệ thống
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-[28px] border border-white/5 backdrop-blur-md">
                    <div className="w-12 h-12 bg-primary-600/20 rounded-2xl flex items-center justify-center">
                        <Tag className="w-6 h-6 text-primary-400" />
                    </div>
                    <div className="pr-4">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</p>
                        <p className="text-sm font-black text-white uppercase tracking-tight">Drafting Mode</p>
                    </div>
                </div>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* LEFT PANEL: CONFIG */}
            <div className="lg:col-span-8 space-y-8">
                <div className="bg-white/[0.03] backdrop-blur-xl rounded-[40px] border border-white/10 p-10 space-y-10 shadow-2xl">
                    <div className="flex items-center gap-4 pb-6 border-b border-white/5">
                        <div className="w-10 h-10 bg-indigo-600/20 rounded-xl flex items-center justify-center">
                            <Settings2 className="w-5 h-5 text-indigo-400" />
                        </div>
                        <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Cấu hình Voucher</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <label className="admin-form-label ml-2">Mã định danh (CODE) *</label>
                            <input 
                                name="code" value={form.code} onChange={handleChange} required
                                placeholder="VD: SIEUDEAL2024"
                                className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-6 py-5 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all font-black tracking-[0.2em] uppercase text-lg"
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="admin-form-label ml-2">Loại hình ưu đãi</label>
                            <div className="grid grid-cols-2 gap-3 p-1 bg-slate-900/50 rounded-2xl border border-white/5">
                                <button type="button" onClick={() => setForm(p => ({...p, discountType: 'Percentage'}))}
                                    className={`py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${form.discountType === 'Percentage' ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
                                    Phần trăm (%)
                                </button>
                                <button type="button" onClick={() => setForm(p => ({...p, discountType: 'Fixed'}))}
                                    className={`py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${form.discountType === 'Fixed' ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
                                    Số tiền cố định
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-4">
                            <label className="admin-form-label ml-2">Giá trị giảm {form.discountType === 'Percentage' ? '(%)' : '(đ)'} *</label>
                            <div className="relative">
                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-primary-400">
                                    {form.discountType === 'Percentage' ? <Percent className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                                </div>
                                <input type="number" name="discountValue" value={form.discountValue} onChange={handleChange} required
                                    placeholder="0" className="admin-form-input !pl-14 !py-5 !bg-slate-900/50 !text-lg !font-black" />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <label className="admin-form-label ml-2">Giảm tối đa (đ)</label>
                            <input type="number" name="maxDiscountAmount" value={form.maxDiscountAmount} onChange={handleChange}
                                placeholder="Để trống nếu không giới hạn" className="admin-form-input !py-5 !bg-slate-900/50 !font-bold" />
                        </div>
                        <div className="space-y-4">
                            <label className="admin-form-label ml-2">Đơn hàng tối thiểu (đ)</label>
                            <input type="number" name="minOrderAmount" value={form.minOrderAmount} onChange={handleChange}
                                placeholder="0" className="admin-form-input !py-5 !bg-slate-900/50 !font-bold" />
                        </div>
                    </div>
                </div>

                {/* LIMITS & DATES */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white/[0.03] backdrop-blur-xl rounded-[40px] border border-white/10 p-10 space-y-8">
                         <div className="flex items-center gap-4 pb-4 border-b border-white/5">
                            <AlertCircle className="w-5 h-5 text-amber-400" />
                            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Giới hạn sử dụng</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <label className="admin-form-label text-[10px]">Tổng lượt dùng</label>
                                <input type="number" name="usageLimit" value={form.usageLimit} onChange={handleChange}
                                    placeholder="∞" className="admin-form-input !bg-slate-900/50 !text-center !text-lg" />
                            </div>
                            <div className="space-y-4">
                                <label className="admin-form-label text-[10px]">Mỗi khách hàng</label>
                                <input type="number" name="perUserLimit" value={form.perUserLimit} onChange={handleChange}
                                    className="admin-form-input !bg-slate-900/50 !text-center !text-lg" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/[0.03] backdrop-blur-xl rounded-[40px] border border-white/10 p-10 space-y-8">
                         <div className="flex items-center gap-4 pb-4 border-b border-white/5">
                            <Calendar className="w-5 h-5 text-green-400" />
                            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Thời hạn hiệu lực</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <label className="admin-form-label text-[10px]">Ngày bắt đầu</label>
                                <input type="datetime-local" name="startDate" value={form.startDate} onChange={handleChange}
                                    className="admin-form-input !bg-slate-900/50 !px-4 !text-[11px]" />
                            </div>
                            <div className="space-y-4">
                                <label className="admin-form-label text-[10px]">Ngày kết thúc</label>
                                <input type="datetime-local" name="expiryDate" value={form.expiryDate} onChange={handleChange}
                                    className="admin-form-input !bg-slate-900/50 !px-4 !text-[11px]" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL: AUDIENCE */}
            <div className="lg:col-span-4 space-y-8">
                <div className="bg-white/[0.03] backdrop-blur-xl rounded-[40px] border border-white/10 p-8 space-y-8 h-full flex flex-col shadow-2xl">
                    <div className="flex items-center justify-between pb-6 border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <Users className="w-5 h-5 text-primary-400" />
                            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Đối tượng áp dụng</h3>
                        </div>
                        <div className="px-3 py-1 bg-primary-600/20 text-primary-400 rounded-full text-[9px] font-black uppercase">
                            {form.targetUserIds.length > 0 ? `${form.targetUserIds.length} Selected` : 'Global'}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="relative">
                            <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input 
                                type="text" placeholder="Tìm kiếm khách hàng..." value={searchUser} onChange={e => setSearchUser(e.target.value)}
                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-xs text-white focus:outline-none focus:border-primary-500 transition-all"
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar space-y-2">
                            {filteredUsers.length === 0 ? (
                                <div className="py-10 text-center text-slate-600 text-[10px] font-bold uppercase tracking-widest italic">
                                    Không tìm thấy user
                                </div>
                            ) : (
                                filteredUsers.map(user => (
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
                                            <div>
                                                <p className="text-[11px] font-black text-white leading-none">{user.fullName || 'No Name'}</p>
                                                <p className="text-[9px] text-slate-500 mt-1">{user.email}</p>
                                            </div>
                                        </div>
                                        {form.targetUserIds.includes(user.id) && <CheckCircle2 className="w-4 h-4 text-primary-400" />}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/5 mt-auto">
                        <button type="submit" disabled={loading}
                            className="w-full py-5 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-black rounded-3xl transition-all shadow-[0_20px_40px_rgba(37,99,235,0.3)] active:scale-[0.98] flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs">
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            <span>{loading ? 'Processing...' : 'Kích hoạt Voucher'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </form>
      </div>
    </div>
  );
}
