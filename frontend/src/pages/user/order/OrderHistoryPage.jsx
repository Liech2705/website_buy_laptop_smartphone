import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { getMyOrders } from '../../../services/orderApi';
import { Package, ChevronRight, Clock, Truck, CheckCircle, XCircle, RefreshCw, LogIn, ShoppingBag, ArrowLeft } from 'lucide-react';

const STATUS_CONFIG = {
  Pending:          { label: 'Chờ xử lý',     color: 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30',  icon: Clock },
  Processing:       { label: 'Đang xử lý',     color: 'text-blue-400 bg-blue-900/20 border-blue-500/30',     icon: RefreshCw },
  Shipped:          { label: 'Đang giao',       color: 'text-sky-400 bg-sky-900/20 border-sky-500/30', icon: Truck },
  Delivered:        { label: 'Đã giao',         color: 'text-green-400 bg-green-900/20 border-green-500/30',   icon: CheckCircle },
  Completed:        { label: 'Hoàn thành',      color: 'text-emerald-400 bg-emerald-900/30 border-emerald-500/30',  icon: CheckCircle },
  Cancelled:        { label: 'Đã huỷ',          color: 'text-red-400 bg-red-900/20 border-red-500/30',       icon: XCircle },
  CancelRequested:  { label: 'Yêu cầu huỷ',    color: 'text-orange-400 bg-orange-900/20 border-orange-500/30', icon: XCircle },
};

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] ?? { label: status, color: 'text-surface-400 bg-surface-200 border-surface-300', icon: Clock };
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${config.color}`}>
      <Icon className="w-3.5 h-3.5" />{config.label}
    </span>
  );
};

const OrderHistoryPage = () => {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return; }
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await getMyOrders();
        setOrders(Array.isArray(data) ? data : []);
      } catch {
        setError('Không thể tải lịch sử đơn hàng.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-surface-50 flex flex-col items-center justify-center gap-8 px-4">
        <div className="w-24 h-24 bg-surface-100 rounded-[30px] flex items-center justify-center border border-surface-200">
          <LogIn className="w-12 h-12 text-surface-300 opacity-20" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-black text-surface-900 uppercase tracking-tighter mb-2">Yêu cầu đăng nhập</h2>
          <p className="text-surface-500 max-w-sm">Vui lòng đăng nhập để xem lịch sử mua sắm và theo dõi hành trình đơn hàng.</p>
        </div>
        <Link to="/login" state={{ from: { pathname: '/profile/orders' } }}
          className="px-10 py-4 bg-primary-600 text-white rounded-2xl hover:bg-primary-700 transition-all font-black uppercase tracking-widest flex items-center gap-3 active:scale-95 shadow-xl shadow-primary-900/20">
          Đăng nhập ngay <ArrowLeft className="w-5 h-5 rotate-180" />
        </Link>
      </div>
    );
  }

  if (loading) return (
    <div className="min-h-screen bg-surface-50 max-w-3xl mx-auto py-12 px-4 space-y-6">
      <div className="h-10 w-48 bg-surface-100 rounded-xl animate-pulse" />
      {[1,2,3].map(i => <div key={i} className="h-40 bg-surface-100 rounded-[30px] animate-pulse border border-surface-200" />)}
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-surface-50 flex flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="p-6 bg-red-950/20 border border-red-500/30 rounded-[30px]">
        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-red-400 font-black uppercase tracking-tight mb-2">Đã có lỗi xảy ra</h3>
        <p className="text-red-300/60 font-medium mb-6">{error}</p>
        <button onClick={() => window.location.reload()} className="px-8 py-3 bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs">
          Thử lại
        </button>
      </div>
    </div>
  );

  if (orders.length === 0) return (
    <div className="min-h-screen bg-surface-50 flex flex-col items-center justify-center gap-8 px-4">
      <div className="w-24 h-24 bg-surface-100 rounded-[30px] flex items-center justify-center border border-surface-200">
        <Package className="w-12 h-12 text-surface-300 opacity-20" />
      </div>
      <div className="text-center">
        <h2 className="text-2xl font-black text-surface-900 uppercase tracking-tighter mb-2">Chưa có đơn hàng nào</h2>
        <p className="text-surface-500">Bắt đầu hành trình công nghệ cùng Liechtop bằng đơn hàng đầu tiên.</p>
      </div>
      <Link to="/products" className="px-10 py-4 bg-primary-600 text-white rounded-2xl hover:bg-primary-700 transition-all font-black uppercase tracking-widest shadow-xl shadow-primary-900/20 active:scale-95">
        MUA SẮM NGAY
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-3xl font-black text-surface-900 uppercase tracking-tighter flex items-center gap-3">
            <Package className="w-8 h-8 text-primary-400" /> Đơn hàng của tôi
          </h1>
          <span className="px-4 py-1.5 bg-surface-100 border border-surface-200 rounded-full text-[10px] font-black text-surface-500 uppercase tracking-widest">
            {orders.length} Đơn {orders.length === 1 ? 'hàng' : 'hàng'}
          </span>
        </div>

        <div className="space-y-6">
          {orders.map(order => (
            <Link key={order.id} to={`/profile/orders/${order.id}`} className="block group">
              <div className="bg-surface-100/30 backdrop-blur-xl rounded-[30px] border border-surface-200/20 p-6 md:p-8 hover:border-primary-500/30 transition-all duration-300 hover:bg-surface-200/10 relative overflow-hidden shadow-xl shadow-black/5 hover:shadow-[0_20px_50px_-12px_rgba(37,99,235,0.15)] active:scale-[0.99] group">
                {/* ID & Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div className="space-y-1">
                    <p className="text-sm font-black text-white uppercase tracking-wider group-hover:text-primary-400 transition-colors">
                      #{order.orderNumber || order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-[10px] font-bold text-surface-500 uppercase tracking-widest flex items-center gap-2">
                       <Clock className="w-3.5 h-3.5" />
                       {new Date(order.createdAt).toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                    </p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                {/* Items Preview */}
                <div className="flex flex-wrap gap-3 mb-6">
                  {order.items?.slice(0, 4).map(item => (
                    <div key={item.id} className="w-14 h-14 bg-surface-200/30 border border-surface-300/20 rounded-2xl p-2 flex items-center justify-center relative overflow-hidden">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt="" className="w-full h-full object-contain mix-blend-screen" 
                          onError={e => e.target.style.display = 'none'} />
                      ) : (
                        <ShoppingBag className="w-5 h-5 text-surface-400" />
                      )}
                      {item.quantity > 1 && (
                        <span className="absolute bottom-1 right-1 bg-primary-600 text-[8px] font-black text-white px-1.5 rounded-full ring-2 ring-surface-100">
                          x{item.quantity}
                        </span>
                      )}
                    </div>
                  ))}
                  {order.items?.length > 4 && (
                    <div className="w-14 h-14 bg-surface-200/30 border border-surface-300/20 rounded-2xl flex items-center justify-center text-[10px] font-black text-surface-500 uppercase tracking-tighter">
                      +{order.items.length - 4}
                    </div>
                  )}
                </div>

                {/* Summary & Detail Link */}
                <div className="flex items-center justify-between pt-6 border-t border-surface-200/10">
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold text-surface-500 uppercase tracking-widest">Tổng thanh toán</p>
                    <p className="text-xl font-black text-primary-400 tracking-tighter">
                      {order.totalPrice.toLocaleString('vi-VN')}₫
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black text-primary-400 uppercase tracking-[0.2em] group-hover:translate-x-2 transition-transform duration-300">
                    Chi tiết đơn hàng <ChevronRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Decorative Background Accent */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary-900/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderHistoryPage;
