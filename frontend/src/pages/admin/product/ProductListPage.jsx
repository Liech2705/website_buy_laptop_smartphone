import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../../../services/productApi';
import { getCategories } from '../../../services/categoryApi';
import { deleteProduct } from '../../../services/productApi';
import { Plus, Search, Edit2, Trash2, ChevronLeft, ChevronRight, Package, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminProductListPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const query = { page, pageSize, ...(search && { search }), ...(categoryFilter && { categoryId: categoryFilter }) };
      const res = await getProducts(query);
      setProducts(res.data ?? []);
      setTotal(res.total ?? 0);
    } catch {
      toast.error('Lỗi tải sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, [page, categoryFilter]);
  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
    // eslint-disable-next-line
  }, []);

  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchProducts(); };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Xóa sản phẩm "${name}"? Thao tác này không thể hoàn tác.`)) return;
    try {
      await deleteProduct(id);
      toast.success('Đã xóa sản phẩm');
      fetchProducts();
    } catch {
      toast.error('Lỗi khi xóa sản phẩm');
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Kho hàng Sản phẩm</h1>
          <p className="text-surface-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Quản lý {total} danh mục thiết bị</p>
        </div>
        <Link
          to="/admin/products/create"
          className="flex items-center gap-3 px-6 py-4 bg-primary-600 hover:bg-primary-500 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-primary-950/40 hover:-translate-y-1 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Khai báo sản phẩm mới
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 p-2 bg-surface-200/30 rounded-3xl border border-surface-200/20">
        <form onSubmit={handleSearch} className="flex-1 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm theo tên sản phẩm..."
              className="w-full pl-12 pr-6 py-4 bg-surface-100/50 border border-surface-200/30 rounded-2xl text-white placeholder-surface-600 focus:ring-2 focus:ring-primary-500 outline-none text-sm font-bold"
            />
          </div>
          <button type="submit" className="px-6 py-4 bg-surface-200 hover:bg-surface-300 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all">
            Lọc
          </button>
        </form>
        <select
          value={categoryFilter}
          onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
          className="px-6 py-4 bg-surface-100/50 border border-surface-200/30 rounded-2xl text-white focus:ring-2 focus:ring-primary-500 outline-none text-xs font-black uppercase tracking-widest appearance-none min-w-[200px] cursor-pointer"
        >
          <option value="" className="bg-surface-100">Tất cả phân loại</option>
          {categories.map(c => <option key={c.id} value={c.id} className="bg-surface-100">{c.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-surface-100/40 backdrop-blur-xl rounded-[40px] border border-surface-200/30 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-200/10 bg-surface-200/20">
                <th className="text-left text-[10px] font-black text-surface-400 uppercase tracking-[0.2em] px-8 py-6">Thông tin sản phẩm</th>
                <th className="text-left text-[10px] font-black text-surface-400 uppercase tracking-[0.2em] px-8 py-6">Phân loại</th>
                <th className="text-left text-[10px] font-black text-surface-400 uppercase tracking-[0.2em] px-8 py-6">Giá niêm yết</th>
                <th className="text-left text-[10px] font-black text-surface-400 uppercase tracking-[0.2em] px-8 py-6">Kho biến thể</th>
                <th className="text-right text-[10px] font-black text-surface-400 uppercase tracking-[0.2em] px-8 py-6">Điều khiển</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200/10">
              {loading
                ? [1,2,3,4,5].map(i => (
                    <tr key={i}>
                      <td colSpan={5} className="px-8 py-6"><div className="h-6 bg-surface-200/20 rounded-full animate-pulse" /></td>
                    </tr>
                  ))
                : products.map(product => (
                    <tr key={product.id} className="group hover:bg-primary-500/5 transition-all">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            {product.imageUrls?.[0] ? (
                                <img src={product.imageUrls[0]} alt={product.name} className="w-14 h-14 rounded-2xl object-cover bg-surface-200 shadow-lg group-hover:scale-110 transition-transform" />
                            ) : (
                                <div className="w-14 h-14 bg-surface-200 rounded-2xl flex items-center justify-center">
                                <Package className="w-6 h-6 text-surface-500" />
                                </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-black text-white group-hover:text-primary-400 transition-colors uppercase tracking-tight truncate max-w-[250px]">{product.name}</p>
                            <p className="text-[10px] font-bold text-surface-500 mt-1 uppercase tracking-widest italic">{product.brandName || 'Liechtop Authorized'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-[10px] font-black uppercase tracking-tighter text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-xl border border-indigo-500/10">
                          {product.categoryName || 'General'}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-sm font-black text-primary-400 italic">
                            {product.basePrice?.toLocaleString('vi-VN')}₫
                        </span>
                      </td>
                      <td className="px-8 py-5 text-sm font-black text-surface-700 italic group-hover:text-white transition-colors">
                        {product.variants?.length ?? 0} sku's
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center justify-end gap-3">
                          <Link
                            to={`/admin/products/${product.id}/edit`}
                            className="p-3 bg-surface-200/50 hover:bg-primary-600 text-surface-400 hover:text-white rounded-xl transition-all shadow-lg active:scale-90"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(product.id, product.name)}
                            className="p-3 bg-surface-200/50 hover:bg-red-500 text-surface-400 hover:text-white rounded-xl transition-all shadow-lg active:scale-90"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
          {!loading && products.length === 0 && (
            <div className="text-center py-24 text-surface-600">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="font-black uppercase tracking-widest text-xs">Cơ sở dữ liệu sản phẩm trống</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-8 py-6 bg-surface-200/10 border-t border-surface-200/10">
            <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest">
              Trang {page} / {totalPages}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setPage(p => Math.max(1, p-1))}
                disabled={page === 1}
                className="p-3 bg-surface-200/50 hover:bg-surface-200 rounded-2xl text-surface-400 disabled:opacity-20 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p+1))}
                disabled={page === totalPages}
                className="p-3 bg-surface-200/50 hover:bg-surface-200 rounded-2xl text-surface-400 disabled:opacity-20 transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
