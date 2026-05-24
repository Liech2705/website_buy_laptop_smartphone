import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories, createCategory } from '../../../services/categoryApi';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Save, Tag, Sparkles, Layers, ChevronRight } from 'lucide-react';

export default function CategoryCreatePage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', parentId: '' });

  useEffect(() => { getCategories().then(setCategories).catch(() => {}); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Vui lòng nhập tên danh mục');
    setSaving(true);
    try {
      await createCategory({ name: form.name.trim(), parentId: form.parentId || null });
      toast.success('Đã tạo danh mục!');
      navigate('/admin/categories');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi tạo danh mục');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center justify-between bg-surface-200 p-8 rounded-[32px] border border-white/10 shadow-2xl">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/admin/categories')} className="p-4 bg-slate-800 hover:bg-primary-600 text-white rounded-2xl transition-all shadow-lg border border-white/5">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Cấu trúc cây sản phẩm</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Thêm Phân Loại Mới</h1>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        <form onSubmit={handleSubmit} className="md:col-span-3 admin-card bg-surface-200/60 space-y-8">
            <div className="space-y-6">
                <div className="space-y-3">
                    <label className="admin-form-label">Tên danh mục hiển thị *</label>
                    <input
                        value={form.name}
                        onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                        placeholder="VD: Gaming Laptops, Phụ kiện..."
                        required
                        className="admin-form-input !bg-slate-900/50 !text-white !font-bold"
                    />
                </div>

                <div className="space-y-3">
                    <label className="admin-form-label">Phụ thuộc Danh mục cha (Nếu có)</label>
                    <div className="relative">
                        <select
                            value={form.parentId}
                            onChange={e => setForm(p => ({ ...p, parentId: e.target.value }))}
                            className="admin-form-select !bg-slate-900/50 !text-white"
                        >
                            <option value="" className="bg-slate-900 text-surface-500 italic">--- Mặc định: Phân loại gốc ---</option>
                            {categories.map(c => <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>)}
                        </select>
                        <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 rotate-90 text-surface-500" />
                    </div>
                </div>
            </div>

            <div className="pt-6 grid grid-cols-2 gap-4">
                <button type="submit" disabled={saving}
                    className="admin-form-btn-primary w-full py-5 flex items-center justify-center gap-3">
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    <span>{saving ? 'Processing...' : 'Lưu Danh Mục'}</span>
                </button>
                <button type="button" onClick={() => navigate('/admin/categories')}
                    className="admin-form-btn-secondary w-full py-4 !bg-transparent border border-white/10 hover:border-white/30">
                    Hủy bỏ
                </button>
            </div>
        </form>

        <div className="md:col-span-2 space-y-8">
            <div className="admin-card bg-surface-200/60 h-full">
                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-6 border-b border-white/5 pb-4 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-400" /> Sơ đồ hiện có
                </h3>
                <div className="space-y-3 custom-scrollbar max-h-[400px] overflow-y-auto pr-2">
                    {categories.filter(c => !c.parentId).map(root => (
                        <div key={root.id} className="space-y-2">
                            <div className="p-3 bg-slate-900/40 rounded-xl border border-white/5 text-[11px] font-black text-white uppercase tracking-tight">
                                {root.name}
                            </div>
                            {categories.filter(sub => sub.parentId === root.id).map(sub => (
                                <div key={sub.id} className="p-2 ml-6 bg-slate-900/20 rounded-lg border border-dashed border-white/5 text-[10px] font-bold text-surface-400 italic">
                                    ↳ {sub.name}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
