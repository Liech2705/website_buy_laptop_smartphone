import { useState, useEffect } from 'react';
import { getAllReviews, deleteReview } from '../../../services/adminApi';
import { toast } from 'react-hot-toast';
import { Star, Trash2, Search, MessageSquare, User, Package, Calendar, Loader2 } from 'lucide-react';

export default function AdminReviewListPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const data = await getAllReviews();
      setReviews(data);
    } catch {
      toast.error('Lỗi tải danh sách đánh giá');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Xác nhận xóa đánh giá này?')) return;
    try {
      await deleteReview(id);
      toast.success('Đã xóa thành công');
      fetchReviews();
    } catch {
      toast.error('Lỗi khi xóa đánh giá');
    }
  };

  const filtered = reviews.filter(r => 
    r.userName?.toLowerCase().includes(search.toLowerCase()) ||
    r.comment?.toLowerCase().includes(search.toLowerCase()) ||
    r.productName?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Đánh giá khách hàng</h1>
          <p className="text-surface-500 text-sm mt-0.5 tracking-tight font-medium">Quản lý phản hồi và xếp hạng sản phẩm</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
          <input
            type="text"
            placeholder="Tìm theo sản phẩm, khách hàng, bình luận..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-surface-100 border border-surface-200/30 rounded-2xl text-surface-800 placeholder-surface-600 focus:ring-2 focus:ring-primary-500 outline-none transition-all font-medium"
          />
        </div>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 gap-4">
        {filtered.map((r) => (
          <div key={r.id} className="group bg-surface-100 rounded-3xl border border-surface-200/30 p-6 hover:border-surface-200 transition-all">
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div className="flex gap-5">
                {/* Product Image */}
                <div className="w-20 h-20 bg-surface-200/50 rounded-2xl flex items-center justify-center p-3 flex-shrink-0">
                  {r.productImage ? (
                    <img src={r.productImage} alt="" className="w-full h-full object-contain mix-blend-screen" />
                  ) : (
                    <Package className="w-8 h-8 text-surface-400 opacity-20" />
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-black text-primary-400 uppercase tracking-widest flex items-center gap-2">
                      <Package className="w-3 h-3" /> {r.productName || 'Sản phẩm không tên'}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1.5 py-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'text-amber-400 fill-amber-400' : 'text-surface-600'}`} />
                    ))}
                    <span className="text-[10px] text-surface-500 font-black ml-1 uppercase tracking-tighter">{r.rating}/5</span>
                  </div>

                  <p className="text-sm text-surface-800 font-medium leading-relaxed max-w-2xl">
                    {r.comment || <span className="italic text-surface-500">Người dùng không để lại bình luận</span>}
                  </p>
                </div>
              </div>

              <div className="flex flex-row md:flex-col justify-between items-end gap-4 flex-shrink-0">
                <div className="text-right">
                  <div className="flex items-center justify-end gap-2 text-xs font-black text-surface-800 uppercase tracking-tight">
                    <User className="w-3 h-3 text-surface-500" />
                    {r.userName || 'Ẩn danh'}
                  </div>
                  <div className="flex items-center justify-end gap-2 text-[10px] text-surface-500 font-bold mt-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(r.createdAt).toLocaleString('vi-VN')}
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(r.id)}
                  className="p-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl transition-all active:scale-95"
                  title="Xóa đánh giá"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="bg-surface-100 rounded-3xl border border-surface-200/30 p-12 text-center">
            <div className="w-16 h-16 bg-surface-200/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-surface-600 opacity-20" />
            </div>
            <p className="text-surface-500 font-medium">Chưa có đánh giá nào phù hợp</p>
          </div>
        )}
      </div>
    </div>
  );
}
