import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAdminOrderDetail, updateOrderStatus, confirmRestock, confirmRefund } from '../../../services/adminApi';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Loader2, Truck, CheckCheck, XCircle, Package, MapPin, User, Phone, Mail, AlertTriangle } from 'lucide-react';

const STATUS_MAP = {
  Pending:        { label: 'Chờ xác nhận', color: 'text-amber-400',  bg: 'bg-amber-500/10',  next: ['Processing', 'Cancelled'] },
  Paid:           { label: 'Đã thanh toán', color: 'text-emerald-400', bg: 'bg-emerald-500/10', next: ['Processing', 'Cancelled'] },
  'Awaiting Payment': { label: 'Chờ thanh toán', color: 'text-yellow-500', bg: 'bg-yellow-500/10', next: ['Cancelled'] },
  Processing:     { label: 'Đang xử lý',   color: 'text-blue-400',   bg: 'bg-blue-500/10',   next: ['Shipped', 'Cancelled'] },
  Shipped:        { label: 'Đang giao',    color: 'text-indigo-400', bg: 'bg-indigo-500/10', next: ['Delivered'] },
  Delivered:      { label: 'Hoàn thành',   color: 'text-green-400',  bg: 'bg-green-500/10',  next: [] },
  Cancelled:      { label: 'Đã hủy',       color: 'text-red-400',    bg: 'bg-red-500/10',    next: [] },
  CancelRequested:{ label: 'Yêu cầu hủy',  color: 'text-orange-400', bg: 'bg-orange-500/10', next: [] },
  Restocked:      { label: 'Đã hoàn kho',  color: 'text-cyan-400',   bg: 'bg-cyan-500/10',   next: [] },
  Failed:         { label: 'Thất bại',     color: 'text-rose-500',   bg: 'bg-rose-500/10',   next: [] },
};

const NEXT_LABEL = { Processing: 'Xác nhận', Shipped: 'Đã giao nhà VC', Delivered: 'Đánh dấu Hoàn thành', Cancelled: 'Từ chối / Hủy đơn' };

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [restocking, setRestocking] = useState(false);
  const [refunding, setRefunding] = useState(false);
  const [tracking, setTracking] = useState({ trackingCode: '', shippingProvider: '' });

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const data = await getAdminOrderDetail(id);
      setOrder(data);
      setTracking({ trackingCode: data.trackingCode ?? '', shippingProvider: data.shippingProvider ?? '' });
    } catch { toast.error('Lỗi tải đơn hàng'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrder(); }, [id]);

  const handleUpdateStatus = async (nextStatus) => {
    if (nextStatus === 'Cancelled' && !window.confirm('Xác nhận hủy đơn hàng này?')) return;
    setUpdating(true);
    try {
      await updateOrderStatus(id, {
        status: nextStatus,
        ...(nextStatus === 'Shipped' ? tracking : {})
      });
      toast.success(`Đã cập nhật trạng thái: ${STATUS_MAP[nextStatus]?.label ?? nextStatus}`);
      fetchOrder();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi cập nhật');
    } finally {
      setUpdating(false);
    }
  };

  const handleConfirmRefund = async () => {
    const isCodCancel = order?.refundRequest?.amount === 0 || order?.refundRequest?.bankName === 'COD (Không hoàn tiền)';
    const confirmMsg = isCodCancel 
      ? 'Xác nhận phê duyệt hủy đơn hàng COD này? (Hệ thống sẽ tự động hoàn lại số lượng tồn kho)'
      : 'Xác nhận đã chuyển khoản hoàn tiền cho khách hàng và hủy đơn hàng? (Hệ thống sẽ tự động hoàn lại số lượng tồn kho)';
    
    if (!window.confirm(confirmMsg)) return;
    setRefunding(true);
    try {
      await confirmRefund(id);
      const successMsg = isCodCancel
        ? 'Đã hủy đơn hàng và hoàn kho thành công'
        : 'Đã hoàn tiền và hủy đơn hàng thành công';
      toast.success(successMsg);
      fetchOrder();
    } catch (err) {
      const errorMsg = isCodCancel
        ? 'Lỗi phê duyệt hủy đơn hàng'
        : 'Lỗi xác nhận hoàn tiền';
      toast.error(err.response?.data?.message || errorMsg);
    } finally {
      setRefunding(false);
    }
  };

  const handleRestock = async () => {
    if (!window.confirm('Xác nhận hoàn kho cho đơn hàng này?')) return;
    setRestocking(true);
    try {
      await confirmRestock(id);
      toast.success('Đã xác nhận hủy và hoàn kho');
      fetchOrder();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi hoàn kho');
    } finally {
      setRestocking(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
    </div>
  );

  if (!order) return (
    <div className="text-center py-20 text-surface-500">
      <p>Không tìm thấy đơn hàng</p>
    </div>
  );

  const statusInfo = STATUS_MAP[order.status] ?? { label: order.status, color: 'text-surface-400', bg: 'bg-surface-500/10', next: [] };
  const address = order.shippingAddress;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <button onClick={() => navigate('/admin/orders')} className="p-3 bg-surface-200/50 hover:bg-surface-200 rounded-2xl text-surface-400 transition-all active:scale-90">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">#{order.orderNumber}</h1>
            <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-current/10 ${statusInfo.bg} ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>
          <p className="text-surface-500 text-xs font-bold uppercase tracking-widest mt-1">
            Giao dịch lúc {order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : ''}
          </p>
        </div>
      </div>

      {order.status === 'CancelRequested' && (
        <div className={`p-6 rounded-[28px] border backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-300 ${
          order.refundRequest?.amount === 0 || order.refundRequest?.bankName === 'COD (Không hoàn tiền)'
            ? 'bg-orange-950/20 border-orange-500/30 text-orange-400 shadow-lg shadow-orange-950/20'
            : 'bg-amber-950/20 border-amber-500/30 text-amber-400 shadow-lg shadow-amber-950/20'
        }`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 flex-shrink-0 ${
              order.refundRequest?.amount === 0 || order.refundRequest?.bankName === 'COD (Không hoàn tiền)'
                ? 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}>
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h4 className="font-black uppercase tracking-tight text-white text-base">
                {order.refundRequest?.amount === 0 || order.refundRequest?.bankName === 'COD (Không hoàn tiền)'
                  ? 'Khách hàng yêu cầu hủy đơn hàng (COD)'
                  : 'Yêu cầu hoàn tiền & Hủy đơn hàng'}
              </h4>
              <p className="text-xs text-surface-400 font-bold mt-0.5">
                {order.refundRequest?.amount === 0 || order.refundRequest?.bankName === 'COD (Không hoàn tiền)'
                  ? 'Đơn hàng chưa thanh toán. Vui lòng kiểm tra lý do và bấm "Phê duyệt hủy đơn (COD)" để hoàn trả lại tồn kho.'
                  : 'Đơn hàng đã thanh toán online. Vui lòng chuyển khoản hoàn tiền thủ công đến tài khoản bên dưới, sau đó bấm "Xác nhận đã hoàn tiền".'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: Order Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-surface-100/40 backdrop-blur-xl rounded-[40px] border border-surface-200/30 overflow-hidden shadow-2xl">
            <div className="px-8 py-5 border-b border-surface-200/10 bg-surface-200/20">
              <h3 className="text-[10px] font-black text-surface-400 uppercase tracking-[0.2em]">Sản phẩm đặt mua</h3>
            </div>
            <div className="divide-y divide-surface-200/10">
              {order.items?.map(item => (
                <div key={item.id} className="flex items-center gap-6 px-8 py-6 group hover:bg-primary-500/5 transition-all">
                  <div className="relative">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.productName} className="w-20 h-20 rounded-2xl object-cover bg-surface-200 shadow-lg group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="w-20 h-20 bg-surface-200 rounded-2xl flex items-center justify-center">
                          <Package className="w-8 h-8 text-surface-500" />
                        </div>
                      )}
                      <span className="absolute -top-2 -right-2 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-black shadow-lg">
                          {item.quantity}
                      </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-white text-base group-hover:text-primary-400 transition-colors uppercase tracking-tight">{item.productName}</p>
                    <p className="text-[10px] font-bold text-surface-500 mt-1 uppercase tracking-widest italic">{item.priceAtPurchase?.toLocaleString('vi-VN')}₫ / đơn vị</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-black text-white text-lg italic">{(item.priceAtPurchase * item.quantity).toLocaleString('vi-VN')}₫</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-8 py-6 border-t border-surface-200/10 flex justify-between items-center bg-surface-200/10">
              <span className="text-xs font-black text-surface-500 uppercase tracking-widest">Tổng giá trị đơn hàng</span>
              <span className="text-2xl font-black text-primary-400 italic">{order.totalPrice?.toLocaleString('vi-VN')}₫</span>
            </div>
          </div>

          {/* Status Update Panel */}
          <div className="bg-surface-100/40 backdrop-blur-xl rounded-[40px] border border-surface-200/30 p-8 space-y-6 shadow-2xl">
            <h3 className="text-[10px] font-black text-surface-400 uppercase tracking-[0.2em]">Tiến trình vận chuyển</h3>

            {/* Shipping fields (only show when going to Shipped) */}
            {statusInfo.next.includes('Shipped') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in zoom-in-95 duration-300">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-surface-500 uppercase tracking-widest px-1">Mã vận đơn</label>
                  <input
                    value={tracking.trackingCode}
                    onChange={e => setTracking(p => ({ ...p, trackingCode: e.target.value }))}
                    placeholder="VD: GHN123456"
                    className="w-full px-5 py-4 bg-surface-200/30 border border-surface-200/30 rounded-2xl text-white text-sm outline-none focus:ring-2 focus:ring-primary-500 focus:bg-surface-200/50 transition-all font-mono font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-surface-500 uppercase tracking-widest px-1">Đơn vị VC</label>
                  <input
                    value={tracking.shippingProvider}
                    onChange={e => setTracking(p => ({ ...p, shippingProvider: e.target.value }))}
                    placeholder="VD: GHN, GHTK, VNPost..."
                    className="w-full px-5 py-4 bg-surface-200/30 border border-surface-200/30 rounded-2xl text-white text-sm outline-none focus:ring-2 focus:ring-primary-500 focus:bg-surface-200/50 transition-all font-bold"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-4">
              {statusInfo.next.map(nextStatus => {
                const isCancelAction = nextStatus === 'Cancelled';
                return (
                  <button
                    key={nextStatus}
                    onClick={() => handleUpdateStatus(nextStatus)}
                    disabled={updating}
                    className={`flex items-center gap-3 px-8 py-4 rounded-[20px] font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 disabled:opacity-50 ${
                      isCancelAction
                        ? 'bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20'
                        : 'bg-primary-600 hover:bg-primary-500 text-white shadow-xl shadow-primary-950/40 hover:-translate-y-1'
                    }`}
                  >
                    {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : (isCancelAction ? <XCircle className="w-4 h-4" /> : <Truck className="w-4 h-4" />)}
                    {NEXT_LABEL[nextStatus] ?? nextStatus}
                  </button>
                );
              })}

              {/* Custom actions for CancelRequested (Online Paid Refunds / COD Cancel Requests) */}
              {order.status === 'CancelRequested' && (
                <>
                  <button
                    onClick={handleConfirmRefund}
                    disabled={refunding || updating}
                    className="flex items-center gap-3 px-8 py-4 rounded-[20px] font-black text-[10px] uppercase tracking-[0.2em] bg-green-600 hover:bg-green-500 text-white transition-all hover:-translate-y-1 shadow-xl shadow-green-950/40 active:scale-95 disabled:opacity-50"
                  >
                    {refunding ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCheck className="w-4 h-4" />}
                    {order.refundRequest?.amount === 0 || order.refundRequest?.bankName === 'COD (Không hoàn tiền)' ? 'Phê duyệt hủy đơn (COD)' : 'Xác nhận đã hoàn tiền'}
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('Processing')}
                    disabled={refunding || updating}
                    className="flex items-center gap-3 px-8 py-4 rounded-[20px] font-black text-[10px] uppercase tracking-[0.2em] bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                    Từ chối yêu cầu hủy
                  </button>
                </>
              )}

              {/* Restock button for cancelled orders */}
              {order.status === 'Cancelled' && (
                <button
                  onClick={handleRestock}
                  disabled={restocking}
                  className="flex items-center gap-3 px-8 py-4 rounded-[20px] font-black text-[10px] uppercase tracking-[0.2em] bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-white border border-cyan-500/20 transition-all hover:-translate-y-1 shadow-xl shadow-cyan-950/20"
                >
                  {restocking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Package className="w-4 h-4" />}
                  Xác nhận hoàn kho
                </button>
              )}

              {statusInfo.next.length === 0 && order.status !== 'Cancelled' && order.status !== 'CancelRequested' && order.status !== 'Restocked' && (
                <div className="flex items-center gap-3 px-8 py-4 bg-green-500/10 rounded-[20px] border border-green-500/20 text-[10px] font-black uppercase tracking-[0.2em] text-green-400">
                  <CheckCheck className="w-5 h-5" />
                  Đơn hàng đã hoàn tất
                </div>
              )}
              
              {order.status === 'Restocked' && (
                <div className="flex items-center gap-3 px-8 py-4 bg-cyan-500/10 rounded-[20px] border border-cyan-500/20 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">
                  <Package className="w-5 h-5" />
                  Hàng đã hoàn về kho
                </div>
              )}
            </div>

            {/* Current tracking info */}
            {order.trackingCode && (
              <div className="p-5 bg-primary-500/5 rounded-3xl border border-primary-500/10 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest mb-1">Mã vận đơn hiện tại</p>
                        <p className="text-lg font-black text-primary-400 font-mono tracking-tighter">{order.trackingCode}</p>
                    </div>
                    {order.shippingProvider && (
                        <div className="text-right">
                            <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest mb-1">Nhà vận chuyển</p>
                            <p className="text-sm font-black text-white italic">{order.shippingProvider}</p>
                        </div>
                    )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Customer Info */}
        <div className="space-y-6">
          <div className="bg-surface-100/40 backdrop-blur-xl rounded-[40px] border border-surface-200/30 p-8 space-y-6 shadow-2xl">
            <h3 className="text-[10px] font-black text-surface-400 uppercase tracking-[0.2em]">Bên nhận hàng</h3>
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary-500/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-primary-500/20">
                    <User className="w-5 h-5 text-primary-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-surface-500 font-black uppercase tracking-widest mb-1">Họ tên</p>
                  <p className="text-base font-black text-white truncate uppercase tracking-tighter italic">{address?.fullName || order.fullName || '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-indigo-500/20">
                    <Phone className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <p className="text-[10px] text-surface-500 font-black uppercase tracking-widest mb-1">Liên lạc</p>
                  <p className="text-base font-black text-white font-mono tracking-tighter">{address?.phone || order.phone || '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-green-500/20">
                    <Mail className="w-5 h-5 text-green-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-surface-500 font-black uppercase tracking-widest mb-1">Email</p>
                  <p className="text-sm font-bold text-white truncate italic">{order.email || 'guest@account.node'}</p>
                </div>
              </div>
              <div className="flex items-start gap-4 pt-4 border-t border-surface-200/10">
                <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-amber-500/20">
                    <MapPin className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-[10px] text-surface-500 font-black uppercase tracking-widest mb-1">Địa chỉ giao hàng</p>
                  <p className="text-sm font-bold text-surface-800 leading-relaxed italic">
                    {order.shippingAddress || '—'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Refund request details card */}
          {order.refundRequest && (
            <div className="bg-surface-100/40 backdrop-blur-xl rounded-[40px] border border-orange-500/30 p-8 space-y-6 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-orange-500/10 transition-all" />
              
              <h3 className="text-[10px] font-black text-orange-400 uppercase tracking-[0.2em] relative z-10 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                {order.refundRequest.amount === 0 || order.refundRequest.bankName === 'COD (Không hoàn tiền)' ? 'Yêu cầu hủy đơn (COD)' : 'Yêu cầu hoàn tiền'}
              </h3>
              
              <div className="space-y-4 relative z-10">
                {!(order.refundRequest.amount === 0 || order.refundRequest.bankName === 'COD (Không hoàn tiền)') ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-surface-500 uppercase tracking-widest">Ngân hàng</span>
                      <span className="text-sm font-black text-white">{order.refundRequest.bankName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-surface-500 uppercase tracking-widest">Số tài khoản</span>
                      <span className="text-sm font-black text-white font-mono">{order.refundRequest.accountNumber}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-surface-500 uppercase tracking-widest">Chủ tài khoản</span>
                      <span className="text-sm font-black text-white uppercase tracking-tighter italic">{order.refundRequest.accountName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-surface-500 uppercase tracking-widest">Số tiền cần hoàn</span>
                      <span className="text-lg font-black text-primary-400 italic">{order.refundRequest.amount?.toLocaleString('vi-VN')}₫</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-surface-500 uppercase tracking-widest">Loại yêu cầu</span>
                    <span className="text-sm font-black text-white uppercase tracking-tighter italic">Hủy đơn hàng COD</span>
                  </div>
                )}
                
                {order.refundRequest.reason && (
                  <div className="pt-4 border-t border-surface-200/10">
                    <span className="text-[10px] font-black text-surface-500 uppercase tracking-widest block mb-1">Lý do hủy</span>
                    <p className="text-xs text-surface-700 font-bold italic leading-relaxed">"{order.refundRequest.reason}"</p>
                  </div>
                )}
                <div className="pt-4 border-t border-surface-200/10 flex justify-between items-center">
                  <span className="text-[10px] font-black text-surface-500 uppercase tracking-widest">Trạng thái yêu cầu</span>
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                    order.refundRequest.status === 'Approved' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                    order.refundRequest.status === 'Rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                    'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                  }`}>
                    {order.refundRequest.status === 'Approved' 
                      ? (order.refundRequest.amount === 0 || order.refundRequest.bankName === 'COD (Không hoàn tiền)' ? 'Đã duyệt hủy' : 'Đã hoàn tiền') 
                      : order.refundRequest.status === 'Rejected' ? 'Đã từ chối' : 'Chờ xử lý'}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-surface-100/40 backdrop-blur-xl rounded-[40px] border border-surface-200/30 p-8 space-y-6 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary-500/10 transition-all" />
            
            <h3 className="text-[10px] font-black text-surface-400 uppercase tracking-[0.2em] relative z-10">Tài chính</h3>
            
            <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-surface-500 uppercase tracking-widest">Phương thức</span>
                  <span className="px-3 py-1 bg-surface-200/50 rounded-lg text-[10px] font-black text-white border border-surface-200/30">{order.paymentMethod || 'COD'}</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-surface-200/10">
                  <span className="text-xs font-black text-surface-800 uppercase tracking-widest">Tổng thanh toán</span>
                  <span className="text-2xl font-black text-primary-400 italic">{order.totalPrice?.toLocaleString('vi-VN')}₫</span>
                </div>
            </div>

            {order.note && (
              <div className="pt-6 border-t border-surface-200/10 relative z-10">
                <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-3 h-3 text-amber-500" />
                    <p className="text-[10px] text-surface-500 font-black uppercase tracking-widest italic">Ghi chú từ khách</p>
                </div>
                <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10">
                    <p className="text-xs text-amber-200/70 font-bold italic leading-relaxed">"{order.note}"</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
