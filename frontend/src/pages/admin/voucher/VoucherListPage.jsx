import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllVouchers, deleteVoucher } from '../../../services/adminApi';
import { toast } from 'react-hot-toast';
import { Plus, Trash2, Edit2, Ticket, Search, Filter, Loader2, Calendar, Lock, Unlock } from 'lucide-react';

export default function AdminVoucherListPage() {
  const navigate = useNavigate();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchVouchers = async () => {
    setLoading(true);
    try { setVouchers(await getAllVouchers()); }
    catch { toast.error('Lỗi tải danh sách voucher'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchVouchers(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Xác nhận xóa voucher này?')) return;
    try {
      await deleteVoucher(id);
      toast.success('Đã xóa thành công');
      fetchVouchers();
    } catch { toast.error('Lỗi khi xóa voucher'); }
  };

  const filtered = vouchers.filter(v => 
    v.code.toLowerCase().includes(search.toLowerCase()) ||
    v.description?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Chiến dịch Ưu đãi</h1>
          <p className="text-surface-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Quản lý các mã Voucher & Coupon hệ thống</p>
        </div>
        <button
          onClick={() => navigate('/admin/vouchers/create')}
          className="flex items-center justify-center gap-3 px-6 py-4 bg-primary-600 hover:bg-primary-500 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-primary-950/40 hover:-translate-y-1 active:scale-95 flex-shrink-0"
        >
          <Plus className="w-4 h-4" /> Tạo chiến dịch mới
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 p-2 bg-surface-200/30 rounded-3xl border border-surface-200/20">
        <div className="relative flex-1">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
          <input
            type="text"
            placeholder="Tìm kiếm mã voucher, mô tả..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-surface-100/50 border border-surface-200/30 rounded-2xl text-white placeholder-surface-600 focus:ring-2 focus:ring-primary-500 outline-none transition-all font-bold text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-100/40 backdrop-blur-xl rounded-[40px] border border-surface-200/30 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-surface-200/10 bg-surface-200/20">
                <th className="px-8 py-6 text-[10px] font-black text-surface-400 uppercase tracking-[0.2em]">Định danh mã</th>
                <th className="px-8 py-6 text-[10px] font-black text-surface-400 uppercase tracking-[0.2em] text-center">Giá trị giảm</th>
                <th className="px-8 py-6 text-[10px] font-black text-surface-400 uppercase tracking-[0.2em] text-center">Hiệu suất</th>
                <th className="px-8 py-6 text-[10px] font-black text-surface-400 uppercase tracking-[0.2em]">Trạng thái</th>
                <th className="px-8 py-6 text-[10px] font-black text-surface-400 uppercase tracking-[0.2em]">Hạn định</th>
                <th className="px-8 py-6 text-[10px] font-black text-surface-400 uppercase tracking-[0.2em] text-right">Điều khiển</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200/10">
              {filtered.map((v) => {
                const now = new Date();
                const isExpired = v.expiryDate && new Date(v.expiryDate) < now;
                const isLimitReached = v.usageLimit && v.usedCount >= v.usageLimit;
                const status = !v.isActive ? 'Inactive' : (isExpired ? 'Expired' : (isLimitReached ? 'Used up' : 'Active'));
                
                return (
                  <tr key={v.id} className="group hover:bg-primary-500/5 transition-all">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 group-hover:scale-110 transition-transform shadow-lg shadow-indigo-950/20">
                          <Ticket className="w-6 h-6 text-indigo-400" />
                        </div>
                        <div>
                          <p className="text-base font-black text-white uppercase tracking-tight group-hover:text-primary-400 transition-colors font-mono tracking-tighter">
                            {v.code}
                          </p>
                          <p className="text-[10px] text-surface-500 font-bold uppercase tracking-widest mt-1 italic">{v.description || 'Global Campaign'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <p className="text-lg font-black text-primary-400 italic">
                        {v.discountAmount ? `${v.discountAmount.toLocaleString('vi-VN')}₫` : `${v.discountPercentage}%`}
                      </p>
                      <p className="text-[9px] text-surface-600 font-black uppercase mt-1 tracking-widest">Min {v.minOrderAmount?.toLocaleString('vi-VN')}₫</p>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="inline-flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-surface-200/50 rounded-full border border-surface-200/30">
                            <span className="text-xs font-black text-white">{v.usedCount}</span>
                            <span className="text-[10px] text-surface-500 font-bold">/ {v.usageLimit ?? '∞'}</span>
                        </div>
                        <span className="text-[9px] font-black text-surface-600 uppercase tracking-widest">Đã sử dụng</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border border-current/10 ${
                        status === 'Active' ? 'bg-green-500/10 text-green-400' : 
                        status === 'Expired' ? 'bg-orange-500/10 text-orange-400' :
                        status === 'Inactive' ? 'bg-red-500/10 text-red-400' : 'bg-surface-300 text-surface-500'
                      }`}>
                        {status === 'Active' ? 'Hoạt động' : 
                         status === 'Expired' ? 'Hết hạn' :
                         status === 'Inactive' ? 'Đã tắt' : 'Hết lượt'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-[10px] text-surface-700 font-black uppercase tracking-widest">
                          <Calendar className="w-3 h-3 text-surface-500" />
                          {v.expiryDate ? new Date(v.expiryDate).toLocaleDateString('vi-VN') : 'Vô thời hạn'}
                        </div>
                        <span className="text-[9px] font-bold text-surface-600 uppercase tracking-widest">Thời hạn hiệu lực</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => navigate(`/admin/vouchers/${v.id}/edit`)}
                          className="p-3 bg-surface-200/50 hover:bg-primary-600 text-surface-400 hover:text-white rounded-xl transition-all shadow-lg active:scale-90"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(v.id)}
                          className="p-3 bg-surface-200/50 hover:bg-red-500 text-surface-400 hover:text-white rounded-xl transition-all shadow-lg active:scale-90"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-24 text-center">
                    <Ticket className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p className="text-xs font-black uppercase tracking-widest text-surface-600 italic">Hệ thống chưa có chiến dịch nào được khởi tạo</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
