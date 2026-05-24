import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCategories, deleteCategory } from '../../../services/categoryApi';
import { Plus, Edit2, Trash2, Tag } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function CategoryListPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch { toast.error('Lỗi tải danh mục'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Xóa danh mục "${name}"? Các sản phẩm trong danh mục này sẽ không bị xóa.`)) return;
    try {
      await deleteCategory(id);
      toast.success('Đã xóa danh mục');
      fetchCategories();
    } catch { toast.error('Lỗi khi xóa danh mục'); }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Phân loại Sản phẩm</h1>
          <p className="text-surface-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Quản lý {categories.length} danh mục cấp cao</p>
        </div>
        <Link to="/admin/categories/create"
          className="flex items-center gap-3 px-6 py-4 bg-primary-600 hover:bg-primary-500 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-primary-950/40 hover:-translate-y-1 active:scale-95">
          <Plus className="w-4 h-4" /> Thêm danh mục mới
        </Link>
      </div>

      <div className="bg-surface-100/40 backdrop-blur-xl rounded-[40px] border border-surface-200/30 overflow-hidden shadow-2xl">
        <table className="w-full">
          <thead>
            <tr className="border-b border-surface-200/10 bg-surface-200/20">
              <th className="text-left text-[10px] font-black text-surface-400 uppercase tracking-[0.2em] px-8 py-6">Tên định danh</th>
              <th className="text-left text-[10px] font-black text-surface-400 uppercase tracking-[0.2em] px-8 py-6">Phân loại cha</th>
              <th className="text-left text-[10px] font-black text-surface-400 uppercase tracking-[0.2em] px-8 py-6">Sản lượng</th>
              <th className="text-right text-[10px] font-black text-surface-400 uppercase tracking-[0.2em] px-8 py-6">Điều khiển</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-200/10">
            {loading
              ? [1,2,3,4].map(i => (
                  <tr key={i}>
                    <td colSpan={4} className="px-8 py-6"><div className="h-6 bg-surface-200/20 rounded-full animate-pulse" /></td>
                  </tr>
                ))
              : categories.map(cat => (
                  <tr key={cat.id} className="group hover:bg-primary-500/5 transition-all">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-surface-200/50 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                          <Tag className="w-5 h-5 text-primary-400" />
                        </div>
                        <span className="font-black text-white text-sm uppercase tracking-tight group-hover:text-primary-400 transition-colors">
                          {cat.parentId ? <span className="text-surface-600 mr-2 font-mono">└</span> : null}
                          {cat.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      {cat.parentName
                        ? <span className="text-[10px] font-black uppercase tracking-tighter text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-xl border border-indigo-500/10">{cat.parentName}</span>
                        : <span className="text-surface-600 text-[10px] font-black uppercase tracking-widest italic opacity-30">Cấp gốc</span>
                      }
                    </td>
                    <td className="px-8 py-5 text-sm font-black text-surface-700 italic group-hover:text-white transition-colors">{cat.productCount ?? 0} items</td>
                    <td className="px-8 py-5">
                      <div className="flex items-center justify-end gap-3">
                        <Link to={`/admin/categories/${cat.id}/edit`}
                          className="p-3 bg-surface-200/50 hover:bg-primary-600 text-surface-400 hover:text-white rounded-xl transition-all shadow-lg active:scale-90">
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button onClick={() => handleDelete(cat.id, cat.name)}
                          className="p-3 bg-surface-200/50 hover:bg-red-500 text-surface-400 hover:text-white rounded-xl transition-all shadow-lg active:scale-90">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
            }
          </tbody>
        </table>
        {!loading && categories.length === 0 && (
          <div className="text-center py-24 text-surface-600">
            <Tag className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="font-black uppercase tracking-widest text-xs">Cấu trúc danh mục trống</p>
          </div>
        )}
      </div>
    </div>
  );
}
