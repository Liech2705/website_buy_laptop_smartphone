import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminStats } from '../../services/adminApi';
import {
  TrendingUp, ShoppingBag, Clock, CheckCircle2, XCircle, Package,
  Users, Truck, ArrowRight, RefreshCw, MessageSquare, Ticket
} from 'lucide-react';

const STATUS_MAP = {
  Pending:        { label: 'Chờ xác nhận', color: 'text-amber-400',   bg: 'bg-amber-500/10',  dot: 'bg-amber-400' },
  Processing:     { label: 'Đang xử lý',   color: 'text-blue-400',    bg: 'bg-blue-500/10',   dot: 'bg-blue-400' },
  Shipped:        { label: 'Đang giao',    color: 'text-indigo-400',  bg: 'bg-indigo-500/10', dot: 'bg-indigo-400' },
  Delivered:      { label: 'Hoàn thành',   color: 'text-green-400',   bg: 'bg-green-500/10',  dot: 'bg-green-400' },
  Cancelled:      { label: 'Đã hủy',       color: 'text-red-400',     bg: 'bg-red-500/10',    dot: 'bg-red-400' },
  CancelRequested:{ label: 'Yêu cầu hủy', color: 'text-orange-400',  bg: 'bg-orange-500/10', dot: 'bg-orange-400' },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_MAP[status] || { label: status, color: 'text-surface-400', bg: 'bg-surface-500/10', dot: 'bg-surface-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${s.bg} ${s.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
};

const KpiCard = ({ icon: Icon, label, value, subLabel, color, gradient }) => (
  <div className={`relative overflow-hidden bg-surface-100 rounded-3xl p-6 border border-surface-200/30 hover:border-surface-200/60 transition-all hover:shadow-xl hover:shadow-black/20 group`}>
    <div className={`absolute inset-0 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity bg-gradient-to-br ${gradient}`} />
    <div className="relative">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-sm font-semibold text-surface-500 mb-1">{label}</p>
      <p className="text-3xl font-black text-white tracking-tight">{value}</p>
      {subLabel && <p className="text-xs text-surface-600 mt-1 font-medium">{subLabel}</p>}
    </div>
  </div>
);

const OrderStatusBar = ({ stats }) => {
  const statuses = [
    { key: 'pendingOrders',     label: 'Chờ xác nhận', color: 'bg-amber-500' },
    { key: 'processingOrders',  label: 'Xử lý',        color: 'bg-blue-500' },
    { key: 'shippedOrders',     label: 'Đang giao',    color: 'bg-indigo-500' },
    { key: 'deliveredOrders',   label: 'Hoàn thành',   color: 'bg-green-500' },
    { key: 'cancelledOrders',   label: 'Đã hủy',       color: 'bg-red-500' },
  ];
  const total = stats?.totalOrders || 1;

  return (
    <div className="bg-surface-100 rounded-3xl p-6 border border-surface-200/30">
      <h3 className="text-sm font-black text-surface-700 uppercase tracking-widest mb-6">Phân bổ đơn hàng</h3>
      
      {/* Stacked bar */}
      <div className="flex h-4 rounded-full overflow-hidden mb-6 gap-px">
        {statuses.map(s => {
          const count = stats?.[s.key] || 0;
          const pct = (count / total) * 100;
          return pct > 0 ? (
            <div key={s.key} style={{ width: `${pct}%` }} className={`${s.color} transition-all`} title={`${s.label}: ${count}`} />
          ) : null;
        })}
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {statuses.map(s => {
          const count = stats?.[s.key] || 0;
          return (
            <div key={s.key} className="text-center">
              <div className={`w-3 h-3 ${s.color} rounded-full mx-auto mb-2`} />
              <p className="text-xl font-black text-surface-900">{count}</p>
              <p className="text-xs text-surface-500 font-medium">{s.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await getAdminStats();
      setStats(data);
    } catch (e) {
      console.error('Lỗi tải thống kê', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const kpis = [
    {
      icon: TrendingUp,
      label: 'Doanh thu (Hoàn thành)',
      value: stats ? `${(stats.totalRevenue / 1_000_000).toFixed(1)}M₫` : '—',
      subLabel: 'Từ các đơn đã giao thành công',
      color: 'bg-green-500/20 text-green-400',
      gradient: 'from-green-600 to-emerald-600',
    },
    {
      icon: ShoppingBag,
      label: 'Tổng đơn hàng',
      value: stats?.totalOrders ?? '—',
      subLabel: `${stats?.deliveredOrders ?? 0} đã hoàn thành`,
      color: 'bg-primary-500/20 text-primary-400',
      gradient: 'from-blue-600 to-primary-600',
    },
    {
      icon: Clock,
      label: 'Đang chờ / Xử lý',
      value: stats ? (stats.pendingOrders + stats.processingOrders) : '—',
      subLabel: 'Cần xử lý ngay',
      color: 'bg-amber-500/20 text-amber-400',
      gradient: 'from-amber-600 to-orange-600',
    },
    {
      icon: Users,
      label: 'Người dùng',
      value: stats?.totalUsers ?? '—',
      subLabel: `${stats?.totalProducts ?? 0} sản phẩm hiện có`,
      color: 'bg-purple-500/20 text-purple-400',
      gradient: 'from-purple-600 to-violet-600',
    },
    {
      icon: MessageSquare,
      label: 'Đánh giá',
      value: stats?.totalReviews ?? '—',
      subLabel: 'Phản hồi từ khách hàng',
      color: 'bg-indigo-500/20 text-indigo-400',
      gradient: 'from-indigo-600 to-blue-600',
    },
    {
      icon: Ticket,
      label: 'Mã giảm giá',
      value: stats?.totalVouchers ?? '—',
      subLabel: 'Chương trình khuyến mãi',
      color: 'bg-rose-500/20 text-rose-400',
      gradient: 'from-rose-600 to-pink-600',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">Tổng quan</h1>
          <p className="text-surface-500 text-sm mt-1">Dữ liệu kinh doanh thời gian thực</p>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="p-3 bg-surface-200/50 hover:bg-surface-200 rounded-2xl text-surface-400 hover:text-surface-800 transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-44 bg-surface-100 rounded-3xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {kpis.map((k, i) => <KpiCard key={i} {...k} />)}
        </div>
      )}

      {/* Order Status Distribution */}
      {!loading && stats && <OrderStatusBar stats={stats} />}

      {/* Recent Orders */}
      <div className="bg-surface-100 rounded-3xl border border-surface-200/30 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-surface-200/20">
          <h3 className="text-sm font-black text-surface-700 uppercase tracking-widest">Đơn hàng gần đây</h3>
          <Link to="/admin/orders" className="flex items-center gap-1 text-xs font-bold text-primary-400 hover:text-primary-300 transition-colors">
            Xem tất cả <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-200/20">
                <th className="text-left text-xs font-black text-surface-400 uppercase tracking-widest px-6 py-4">Mã đơn</th>
                <th className="text-left text-xs font-black text-surface-400 uppercase tracking-widest px-6 py-4">Khách hàng</th>
                <th className="text-left text-xs font-black text-surface-400 uppercase tracking-widest px-6 py-4">Tổng tiền</th>
                <th className="text-left text-xs font-black text-surface-400 uppercase tracking-widest px-6 py-4">Trạng thái</th>
                <th className="text-left text-xs font-black text-surface-400 uppercase tracking-widest px-6 py-4">Ngày tạo</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? [1,2,3].map(i => (
                    <tr key={i}><td colSpan={5} className="px-6 py-4"><div className="h-5 bg-surface-200 rounded animate-pulse" /></td></tr>
                  ))
                : (stats?.recentOrders ?? []).map(order => (
                    <tr key={order.id} className="border-b border-surface-200/10 hover:bg-surface-200/20 transition-colors">
                      <td className="px-6 py-4">
                        <Link to={`/admin/orders/${order.id}`} className="text-sm font-bold text-primary-400 hover:text-primary-300 font-mono">
                          #{order.orderNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-surface-900 font-medium">{order.customerName || '—'}</td>
                      <td className="px-6 py-4 text-sm text-primary-400 font-bold">
                        {order.totalPrice?.toLocaleString('vi-VN')}₫
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-6 py-4 text-xs text-surface-600 font-medium">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : '—'}
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
          {!loading && !stats?.recentOrders?.length && (
            <div className="text-center py-12 text-surface-600 font-semibold">Chưa có đơn hàng nào</div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/admin/products/create" className="flex items-center gap-4 p-5 bg-surface-100 rounded-3xl border border-surface-200/30 hover:border-primary-500/50 hover:bg-primary-900/10 transition-all group">
          <div className="w-12 h-12 bg-primary-600/20 rounded-2xl flex items-center justify-center group-hover:bg-primary-600/30 transition-colors">
            <Package className="w-6 h-6 text-primary-400" />
          </div>
          <div>
            <p className="font-bold text-surface-900 text-sm">Thêm Sản phẩm</p>
            <p className="text-xs text-surface-600">Tạo sản phẩm mới</p>
          </div>
        </Link>
        <Link to="/admin/orders?status=Pending" className="flex items-center gap-4 p-5 bg-surface-100 rounded-3xl border border-surface-200/30 hover:border-amber-500/50 hover:bg-amber-900/10 transition-all group">
          <div className="w-12 h-12 bg-amber-600/20 rounded-2xl flex items-center justify-center group-hover:bg-amber-600/30 transition-colors">
            <Clock className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <p className="font-bold text-surface-900 text-sm">Đơn chờ xử lý</p>
            <p className="text-xs text-surface-600">{stats?.pendingOrders ?? 0} đơn cần xác nhận</p>
          </div>
        </Link>
        <Link to="/admin/categories" className="flex items-center gap-4 p-5 bg-surface-100 rounded-3xl border border-surface-200/30 hover:border-purple-500/50 hover:bg-purple-900/10 transition-all group">
          <div className="w-12 h-12 bg-purple-600/20 rounded-2xl flex items-center justify-center group-hover:bg-purple-600/30 transition-colors">
            <CheckCircle2 className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <p className="font-bold text-surface-900 text-sm">Quản lý danh mục</p>
            <p className="text-xs text-surface-600">Thêm / sửa danh mục</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
