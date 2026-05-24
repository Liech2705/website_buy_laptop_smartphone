import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getAllOrders } from '../../../services/adminApi';
import { ShoppingBag, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';

const STATUS_OPTIONS = ['', 'Pending', 'Paid', 'Awaiting Payment', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'CancelRequested', 'Restocked', 'Failed'];
const STATUS_MAP = {
  Pending:        { label: 'Chờ xác nhận', color: 'text-amber-400',  bg: 'bg-amber-500/10'  },
  Paid:           { label: 'Đã thanh toán', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  'Awaiting Payment': { label: 'Chờ thanh toán', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  Processing:     { label: 'Đang xử lý',   color: 'text-blue-400',   bg: 'bg-blue-500/10'   },
  Shipped:        { label: 'Đang giao',    color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  Delivered:      { label: 'Hoàn thành',   color: 'text-green-400',  bg: 'bg-green-500/10'  },
  Cancelled:      { label: 'Đã hủy',       color: 'text-red-400',    bg: 'bg-red-500/10'    },
  CancelRequested:{ label: 'Yêu cầu hủy',  color: 'text-orange-400', bg: 'bg-orange-500/10' },
  Restocked:      { label: 'Đã hoàn kho',  color: 'text-cyan-400',   bg: 'bg-cyan-500/10'   },
  Failed:         { label: 'Thất bại',     color: 'text-rose-500',   bg: 'bg-rose-500/10'   },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_MAP[status] || { label: status, color: 'text-surface-400', bg: 'bg-surface-500/10' };
  return <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${s.bg} ${s.color} border border-current/10`}>{s.label}</span>;
};

export default function AdminOrderListPage() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get('status') || '';
  const pageSize = 15;

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await getAllOrders(page, pageSize, statusFilter || null);
      setOrders(res.data ?? []);
      setTotal(res.total ?? 0);
    } catch { toast.error('Lỗi tải đơn hàng'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [page, statusFilter]);

  const setStatus = (s) => { setSearchParams(s ? { status: s } : {}); setPage(1); };
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Quản lý Đơn hàng</h1>
          <p className="text-surface-500 text-xs font-bold uppercase tracking-widest mt-1">Hệ thống ghi nhận {total} giao dịch</p>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2 bg-surface-200/30 p-2 rounded-3xl border border-surface-200/20">
        {STATUS_OPTIONS.map(s => (
          <button key={s} onClick={() => setStatus(s)}
            className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
              statusFilter === s
                ? 'bg-primary-600 text-white shadow-xl shadow-primary-950/40 scale-105'
                : 'text-surface-400 hover:text-white hover:bg-surface-200/50'
            }`}>
            {s ? (STATUS_MAP[s]?.label ?? s) : 'Tất cả đơn'}
          </button>
        ))}
      </div>

      <div className="bg-surface-100/40 backdrop-blur-xl rounded-[40px] border border-surface-200/30 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-200/10 bg-surface-200/20">
                <th className="text-left text-[10px] font-black text-surface-400 uppercase tracking-[0.2em] px-8 py-6">Mã định danh</th>
                <th className="text-left text-[10px] font-black text-surface-400 uppercase tracking-[0.2em] px-8 py-6">Khách hàng</th>
                <th className="text-left text-[10px] font-black text-surface-400 uppercase tracking-[0.2em] px-8 py-6">Giá trị</th>
                <th className="text-left text-[10px] font-black text-surface-400 uppercase tracking-[0.2em] px-8 py-6">Trạng thái</th>
                <th className="text-left text-[10px] font-black text-surface-400 uppercase tracking-[0.2em] px-8 py-6">Thời gian</th>
                <th className="text-right text-[10px] font-black text-surface-400 uppercase tracking-[0.2em] px-8 py-6">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200/10">
              {loading
                ? [1,2,3,4,5,6].map(i => (
                    <tr key={i}>
                      <td colSpan={6} className="px-8 py-6"><div className="h-6 bg-surface-200/20 rounded-full animate-pulse" /></td>
                    </tr>
                  ))
                : orders.map(order => (
                    <tr key={order.id} className="hover:bg-primary-500/5 transition-all group">
                      <td className="px-8 py-5">
                        <span className="text-sm font-black text-white font-mono bg-surface-200/50 px-3 py-1 rounded-lg border border-surface-200/30 group-hover:border-primary-500/50 transition-colors">
                            #{order.orderNumber}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col">
                            <span className="text-sm font-black text-surface-900 group-hover:text-white transition-colors uppercase tracking-tight">
                                {order.fullName || '—'}
                            </span>
                            <span className="text-[10px] font-bold text-surface-500 truncate max-w-[150px] italic">
                                {order.email || 'guest@account.node'}
                            </span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-sm font-black text-primary-400 italic">
                            {order.totalPrice?.toLocaleString('vi-VN')}₫
                        </span>
                      </td>
                      <td className="px-8 py-5"><StatusBadge status={order.status} /></td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-surface-700 uppercase">
                                {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : '—'}
                            </span>
                            <span className="text-[9px] font-bold text-surface-600 uppercase">
                                {order.createdAt ? new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <Link to={`/admin/orders/${order.id}`}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-surface-200/50 hover:bg-primary-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all hover:shadow-lg hover:shadow-primary-900/40">
                          Chi tiết
                        </Link>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
          {!loading && orders.length === 0 && (
            <div className="text-center py-24 text-surface-600">
              <div className="w-20 h-20 bg-surface-200/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-surface-200/30">
                <ShoppingBag className="w-10 h-10 opacity-20" />
              </div>
              <p className="font-black uppercase tracking-[0.2em] text-xs">Cơ sở dữ liệu trống</p>
            </div>
          )}
        </div>
        
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-8 py-6 bg-surface-200/10 border-t border-surface-200/10">
            <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest">Trang {page} / {totalPages}</p>
            <div className="flex gap-3">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
                className="p-3 bg-surface-200/50 hover:bg-surface-200 rounded-2xl text-surface-400 disabled:opacity-20 transition-all">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}
                className="p-3 bg-surface-200/50 hover:bg-surface-200 rounded-2xl text-surface-400 disabled:opacity-20 transition-all">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
