import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCategories, updateCategory, getCategoryById } from '../../../services/categoryApi';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Save, Tag, Sparkles, Layers, ChevronRight, Loader2, Info } from 'lucide-react';

export default function CategoryEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', parentId: '' });

  useEffect(() => {
    Promise.all([getCategories(), getCategoryById(id)])
      .then(([all, current]) => {
        setCategories(all.filter(c => c.id !== id)); // Prevent self-referencing parent
        setForm({ name: current.name, parentId: current.parentId || '' });
      })
      .catch(() => toast.error('Lỗi tải dữ liệu'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Tên không được để trống');
    setSaving(true);
    try {
      await updateCategory(id, { name: form.name.trim(), parentId: form.parentId || null });
      toast.success('Đã tối ưu hóa danh mục!');
      navigate('/admin/categories');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi cập nhật');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center space-y-4">
      <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Retrieving structural data...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 pb-20 animate-in fade-in duration-700">
      <div className="max-w-4xl mx-auto space-y-10 pt-10 px-4">
        
        {/* PREMIUM HEADER */}
        <div className="relative group overflow-hidden bg-white/[0.03] backdrop-blur-3xl p-10 rounded-[40px] border border-white/10 shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/10 rounded-full blur-[120px] -mr-48 -mt-48" />
            <div className="relative flex items-center gap-8">
                <button onClick={() => navigate('/admin/categories')} className="p-5 bg-white/5 hover:bg-primary-600 text-white rounded-[24px] transition-all shadow-xl active:scale-90 border border-white/5">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Sparkles className="w-4 h-4 text-primary-400" />
                        <span className="text-[10px] font-black text-primary-400 uppercase tracking-[0.4em]">Architecture Refinement</span>
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Hiệu Chỉnh <span className="text-primary-400">Phân Loại</span></h1>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2 opacity-60 italic">Cấu trúc cây danh mục • {id.split('-')[0]}</p>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <form onSubmit={handleSubmit} className="md:col-span-7 bg-white/[0.03] backdrop-blur-xl rounded-[40px] border border-white/10 p-10 space-y-10 shadow-2xl">
                <div className="space-y-8">
                    <div className="space-y-4">
                        <label className="admin-form-label ml-2 flex items-center gap-2">
                            <Tag className="w-3 h-3 text-primary-400" /> Tên danh mục hiển thị
                        </label>
                        <input
                            value={form.name}
                            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                            required
                            className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-6 py-5 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-black uppercase text-lg tracking-tight"
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="admin-form-label ml-2 flex items-center gap-2">
                            <Layers className="w-3 h-3 text-indigo-400" /> Danh mục cấp cha
                        </label>
                        <div className="relative group">
                            <select
                                value={form.parentId}
                                onChange={e => setForm(p => ({ ...p, parentId: e.target.value }))}
                                className="admin-form-select !bg-slate-900/50 !py-5 !px-8 !text-sm !font-bold"
                            >
                                <option value="" className="bg-slate-900">--- Không có (Danh mục gốc) ---</option>
                                {categories.map(c => <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>)}
                            </select>
                            <ChevronRight className="absolute right-8 top-1/2 -translate-y-1/2 w-5 h-5 rotate-90 text-slate-600 pointer-events-none group-hover:text-primary-400 transition-colors" />
                        </div>
                    </div>
                </div>

                <div className="pt-10 grid grid-cols-2 gap-6">
                    <button type="submit" disabled={saving}
                        className="w-full py-5 bg-gradient-to-r from-primary-600 to-indigo-600 text-white font-black rounded-3xl transition-all shadow-[0_20px_40px_rgba(37,99,235,0.2)] active:scale-95 flex items-center justify-center gap-3 uppercase text-xs tracking-widest">
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        <span>{saving ? 'Syncing...' : 'Lưu Thay Đổi'}</span>
                    </button>
                    <button type="button" onClick={() => navigate('/admin/categories')}
                        className="w-full py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors border border-white/5 rounded-3xl">
                        Hủy bỏ
                    </button>
                </div>
            </form>

            <div className="md:col-span-5 bg-white/[0.03] backdrop-blur-xl rounded-[40px] border border-white/10 p-8 space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                    <Info className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Hướng dẫn cấu trúc</h3>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Việc thay đổi danh mục cha sẽ di chuyển toàn bộ các sản phẩm thuộc danh mục này sang nhánh mới trong sơ đồ trang web. Hãy cân nhắc kỹ trước khi thay đổi để không làm ảnh hưởng đến SEO.
                </p>
                <div className="p-6 bg-slate-900/50 rounded-2xl border border-white/5 italic text-[11px] text-slate-400">
                    "Phân loại đúng giúp khách hàng tìm thấy sản phẩm của bạn nhanh hơn 40%."
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
