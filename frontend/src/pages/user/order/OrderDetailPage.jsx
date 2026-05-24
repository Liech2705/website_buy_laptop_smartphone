import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { getOrderById, cancelOrder } from '../../../services/orderApi';
import { createReview, canReviewProduct, uploadReviewImage } from '../../../services/reviewApi';
import {
  ArrowLeft, Package, MapPin, Phone, Mail, Clock,
  Truck, CheckCircle, XCircle, RefreshCw, Ban, Shield, ShoppingBag, CreditCard,
  Star, Camera, Plus, Trash2
} from 'lucide-react';


const STATUS_CONFIG = {
  Pending:         { label: 'Chờ xử lý',   color: 'text-yellow-400', bg: 'bg-yellow-900/20', border: 'border-yellow-500/30', icon: Clock },
  Processing:      { label: 'Đang xử lý',   color: 'text-blue-400',   bg: 'bg-blue-900/20',   border: 'border-blue-500/30',   icon: RefreshCw },
  Shipped:         { label: 'Đang giao',     color: 'text-sky-400',    bg: 'bg-sky-900/20',    border: 'border-sky-500/30',    icon: Truck },
  Delivered:       { label: 'Đã giao',       color: 'text-green-400',  bg: 'bg-green-900/20',  border: 'border-green-500/30',  icon: CheckCircle },
  Completed:       { label: 'Hoàn thành',    color: 'text-emerald-400', bg: 'bg-emerald-900/30', border: 'border-emerald-500/30', icon: CheckCircle },
  Cancelled:       { label: 'Đã huỷ',        color: 'text-red-400',    bg: 'bg-red-900/20',   border: 'border-red-500/30',    icon: XCircle },
  CancelRequested: { label: 'Yêu cầu huỷ',  color: 'text-orange-400', bg: 'bg-orange-900/20', border: 'border-orange-500/30', icon: XCircle },
};

const TIMELINE = [
  { status: 'Pending',    label: 'Đặt hàng', icon: ShoppingBag },
  { status: 'Processing', label: 'Xác nhận', icon: Shield },
  { status: 'Shipped',    label: 'Đang giao', icon: Truck },
  { status: 'Delivered',  label: 'Đã giao',   icon: CheckCircle },
];

const statusOrder = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Completed'];

const OrderDetailPage = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [cancelling, setCancelling] = useState(false);

  // Refund Modal States
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [reason, setReason] = useState('');

  // Review Modal States
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedItemForReview, setSelectedItemForReview] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewImages, setReviewImages] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewedStatus, setReviewedStatus] = useState({});

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getOrderById(id);
        setOrder(data);
        
        // Fetch reviewable status for items if delivered/completed
        if (data?.items?.length > 0 && ['Delivered', 'Completed'].includes(data.status)) {
          const statusMap = {};
          for (const item of data.items) {
            if (item.productId) {
              try {
                const canRev = await canReviewProduct(item.productId);
                statusMap[item.productId] = canRev;
              } catch (e) {
                console.error("Lỗi khi kiểm tra trạng thái đánh giá cho sản phẩm", item.productId, e);
                statusMap[item.productId] = false;
              }
            }
          }
          setReviewedStatus(statusMap);
        }
      } catch {
        setError('Không tìm thấy đơn hàng hoặc bạn không có quyền xem.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, isAuthenticated, navigate]);

  const handleCancelClick = () => {
    setShowRefundModal(true);
  };

  const handleRefundSubmit = async (e) => {
    e.preventDefault();
    const isPaid = order.paidAt || ['Paid', 'Processing'].includes(order.status);
    if (isPaid && (!bankName || !accountNumber || !accountName)) {
      alert('Vui lòng nhập đầy đủ thông tin tài khoản ngân hàng.');
      return;
    }
    setCancelling(true);
    try {
      await cancelOrder(id, {
        bankName: isPaid ? bankName : "COD (Không hoàn tiền)",
        accountNumber: isPaid ? accountNumber : "N/A",
        accountName: isPaid ? accountName : "N/A",
        reason
      });
      setShowRefundModal(false);
      const data = await getOrderById(id);
      setOrder(data);
      alert(isPaid ? 'Yêu cầu huỷ và hoàn tiền đã được gửi thành công!' : 'Yêu cầu huỷ đơn hàng đã được gửi thành công!');
    } catch (err) {
      alert(err?.response?.data?.message || 'Không thể gửi yêu cầu huỷ.');
    } finally {
      setCancelling(false);
    }
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploadingImage(true);
    const uploadedUrls = [...reviewImages];

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        alert(`Kích thước file ${file.name} vượt quá 5MB.`);
        continue;
      }
      try {
        const res = await uploadReviewImage(file);
        if (res?.url) {
          uploadedUrls.push(res.url);
        }
      } catch (err) {
        console.error("Error uploading file:", err);
        alert(`Tải ảnh ${file.name} thất bại.`);
      }
    }

    setReviewImages(uploadedUrls);
    setUploadingImage(false);
  };

  const handleRemoveImage = (indexToRemove) => {
    setReviewImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      alert('Vui lòng nhập nội dung đánh giá.');
      return;
    }
    if (!selectedItemForReview?.productId) {
      alert('Không tìm thấy thông tin sản phẩm.');
      return;
    }

    setSubmittingReview(true);
    try {
      await createReview({
        productId: selectedItemForReview.productId,
        rating: reviewRating,
        comment: reviewComment,
        imageUrls: reviewImages
      });

      alert('Cảm ơn bạn đã đánh giá sản phẩm!');
      setShowReviewModal(false);
      
      // Update local review status map to mark as already reviewed
      setReviewedStatus(prev => ({
        ...prev,
        [selectedItemForReview.productId]: false
      }));
    } catch (err) {
      alert(err?.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá.');
    } finally {
      setSubmittingReview(false);
    }
  };


  if (loading) return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 border-4 border-primary-900/30 rounded-full" />
        <div className="absolute inset-0 border-4 border-t-primary-500 rounded-full animate-spin" />
      </div>
    </div>
  );

  if (error || !order) return (
    <div className="min-h-screen bg-surface-50 flex flex-col items-center justify-center gap-6 px-4">
      <div className="w-24 h-24 bg-surface-100 rounded-[30px] flex items-center justify-center text-surface-300 opacity-20 border border-surface-200">
        <XCircle className="w-12 h-12" />
      </div>
      <p className="text-surface-500 font-bold uppercase tracking-widest text-center">{error}</p>
      <Link to="/profile/orders" className="px-10 py-4 bg-primary-600 text-white rounded-2xl font-black uppercase tracking-widest transition-all hover:bg-primary-700 shadow-xl shadow-primary-900/20 active:scale-95">
        Quay lại lịch sử
      </Link>
    </div>
  );

  const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.Pending;
  const Icon = cfg.icon;
  const currentStep = statusOrder.indexOf(order.status);
  const canCancel = ['Pending', 'Processing'].includes(order.status);
  const isPaid = order.paidAt || ['Paid', 'Processing'].includes(order.status);

  return (
    <div className="min-h-screen bg-surface-50 pb-20">
      {/* Header Area */}
      <div className="bg-surface-100 border-b border-surface-200 pt-10 pb-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.05),transparent)]" />
        <div className="container mx-auto px-4 max-w-4xl relative z-10">
          <Link to="/profile/orders" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-surface-500 hover:text-primary-400 transition-colors mb-6 group">
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> Trở về lịch sử
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <h1 className="text-3xl md:text-5xl font-black text-surface-900 uppercase tracking-tighter">
                Đơn hàng #{order.orderNumber || order.id.slice(0, 8).toUpperCase()}
              </h1>
              <p className="text-xs font-bold text-surface-500 uppercase tracking-widest flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                Khởi tạo: {new Date(order.createdAt).toLocaleString('vi-VN')}
              </p>
            </div>
            
            <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl border ${cfg.bg} ${cfg.border} ${cfg.color} font-black uppercase tracking-widest text-[10px]`}>
              <Icon className="w-4 h-4" />
              {cfg.label}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* PROGRESS BOX */}
        <div className="lg:col-span-12">
          {order.status !== 'Cancelled' && order.status !== 'CancelRequested' ? (
            <div className="bg-surface-100/30 backdrop-blur-xl rounded-[40px] border border-surface-200/20 p-8 md:p-12 shadow-xl shadow-black/5 hover:border-primary-500/20 transition-all duration-300">
              <h2 className="text-xs font-black text-surface-400 uppercase tracking-[0.2em] mb-10 text-center">Tiến trình vận chuyển</h2>
              <div className="flex items-center justify-between relative max-w-2xl mx-auto">
                <div className="absolute top-5 left-0 right-0 h-1 bg-surface-200/20 rounded-full" />
                <div
                  className="absolute top-5 left-0 h-1 bg-primary-500 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(37,99,235,0.5)]"
                  style={{ width: `${Math.min(100, (currentStep / (TIMELINE.length - 1)) * 100)}%` }}
                />
                
                {TIMELINE.map((step, i) => {
                  const done = currentStep >= i;
                  const StepIcon = step.icon;
                  return (
                    <div key={step.status} className="relative flex flex-col items-center gap-3 z-10">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 ${
                        done ? 'bg-primary-600 border-primary-500 text-white shadow-xl shadow-primary-900/20 rotate-0' : 'bg-surface-200/50 border-surface-300/30 text-surface-400 rotate-12 scale-90'
                      }`}>
                        <StepIcon className={`w-5 h-5 ${done ? 'animate-pulse' : ''}`} />
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest text-center ${done ? 'text-surface-900' : 'text-surface-500'}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
              
              {order.trackingCode && (
                <div className="mt-12 bg-primary-900/20 border border-primary-500/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Truck className="w-5 h-5 text-primary-400" />
                    <span className="text-[10px] font-black text-primary-400 uppercase tracking-widest">Mã vận đơn:</span>
                    <span className="text-sm font-black text-white tracking-widest uppercase">{order.trackingCode}</span>
                  </div>
                  {order.shippingProvider && (
                     <div className="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-black text-surface-400 uppercase tracking-widest border border-white/5">
                        {order.shippingProvider}
                     </div>
                  )}
                </div>
              )}
            </div>
          ) : order.status === 'CancelRequested' ? (
            (order.refundRequest?.amount === 0 || order.refundRequest?.bankName === 'COD (Không hoàn tiền)') ? (
              <div className="bg-orange-950/20 border border-orange-500/30 rounded-[40px] p-10 flex flex-col items-center text-center gap-4 backdrop-blur-xl">
                 <Ban className="w-12 h-12 text-orange-500 opacity-50 animate-pulse" />
                 <div className="space-y-1">
                   <h3 className="text-xl font-black text-orange-400 uppercase tracking-tight">ĐANG CHỜ PHÊ DUYỆT HỦY ĐƠN (COD)</h3>
                   <p className="text-sm font-medium text-orange-300/60">Hệ thống đã tiếp nhận yêu cầu hủy đơn hàng COD và đang chờ Admin duyệt chuyển trạng thái.</p>
                 </div>
              </div>
            ) : (
              <div className="bg-orange-950/20 border border-orange-500/30 rounded-[40px] p-10 flex flex-col items-center text-center gap-4 backdrop-blur-xl">
                 <Ban className="w-12 h-12 text-orange-500 opacity-50 animate-pulse" />
                 <div className="space-y-1">
                   <h3 className="text-xl font-black text-orange-400 uppercase tracking-tight">ĐANG YÊU CẦU HUỶ & HOÀN TIỀN</h3>
                   <p className="text-sm font-medium text-orange-300/60">Hệ thống đã tiếp nhận yêu cầu và đang chờ Admin chuyển khoản hoàn tiền thủ công.</p>
                 </div>
              </div>
            )
          ) : (
            <div className="bg-red-950/20 border border-red-500/30 rounded-[40px] p-10 flex flex-col items-center text-center gap-4 backdrop-blur-xl">
               <Ban className="w-12 h-12 text-red-500 opacity-50" />
               <div className="space-y-1">
                 <h3 className="text-xl font-black text-red-400 uppercase tracking-tight">ĐƠN HÀNG ĐÃ HUỶ</h3>
                 <p className="text-sm font-medium text-red-300/60">Đơn hàng này đã được hủy bỏ và không còn hiệu lực thực thi.</p>
               </div>
            </div>
          )}
        </div>

        {/* LEFT COLUMN - INFO BOXES (Col: 8) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Shipping Info Card */}
          <div className="bg-surface-100/30 backdrop-blur-xl rounded-[40px] border border-surface-200/20 p-8 space-y-6 shadow-xl shadow-black/5 hover:border-primary-500/20 transition-all duration-300">
            <h2 className="font-black text-surface-900 text-lg uppercase tracking-tight flex items-center gap-3">
              <div className="w-8 h-8 bg-surface-200/30 rounded-lg flex items-center justify-center text-primary-400"><MapPin className="w-4 h-4" /></div>
              Thông tin nhận hàng
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest">Người nhận</p>
                <p className="font-black text-surface-900 uppercase text-base">{order.fullName || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest">Số điện thoại</p>
                <p className="font-black text-surface-900">{order.phone || 'N/A'}</p>
              </div>
              <div className="md:col-span-2 space-y-1">
                <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest">Địa chỉ giao hàng</p>
                <p className="font-medium text-surface-700 leading-relaxed">{order.shippingAddress || 'N/A'}</p>
              </div>
            </div>
          </div>

          {order.refundRequest && (
            <div className="bg-surface-100/30 backdrop-blur-xl rounded-[40px] border border-surface-200/20 p-8 space-y-6 shadow-xl shadow-black/5 hover:border-primary-500/20 transition-all duration-300">
              {order.refundRequest.amount === 0 || order.refundRequest.bankName === 'COD (Không hoàn tiền)' ? (
                <>
                  <h2 className="font-black text-surface-900 text-lg uppercase tracking-tight flex items-center gap-3">
                    <div className="w-8 h-8 bg-surface-200/30 rounded-lg flex items-center justify-center text-orange-400"><Ban className="w-4 h-4" /></div>
                    Thông tin yêu cầu hủy
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest">Trạng thái yêu cầu</p>
                      <span className={`inline-flex items-center px-3 py-1 rounded-xl font-bold uppercase tracking-widest text-[9px] border ${
                        order.refundRequest.status === 'Approved' ? 'bg-green-900/20 border-green-500/30 text-green-400' :
                        order.refundRequest.status === 'Rejected' ? 'bg-red-900/20 border-red-500/30 text-red-400' :
                        'bg-yellow-900/20 border-yellow-500/30 text-yellow-400 animate-pulse'
                      }`}>
                        {order.refundRequest.status === 'Approved' ? 'Đã phê duyệt hủy' :
                         order.refundRequest.status === 'Rejected' ? 'Từ chối hủy đơn' :
                         'Đang chờ xử lý'}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest">Phương thức hủy</p>
                      <p className="font-black text-primary-400 text-base">COD (Không hoàn tiền)</p>
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest">Ngày yêu cầu</p>
                      <p className="font-bold text-surface-700">{new Date(order.refundRequest.createdAt).toLocaleString('vi-VN')}</p>
                    </div>
                    {order.refundRequest.reason && (
                      <div className="md:col-span-2 space-y-1">
                        <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest">Lý do huỷ đơn</p>
                        <p className="font-medium text-surface-700 italic">"{order.refundRequest.reason}"</p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <h2 className="font-black text-surface-900 text-lg uppercase tracking-tight flex items-center gap-3">
                    <div className="w-8 h-8 bg-surface-200/30 rounded-lg flex items-center justify-center text-orange-400"><RefreshCw className="w-4 h-4" /></div>
                    Thông tin hoàn tiền
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest">Trạng thái hoàn tiền</p>
                      <span className={`inline-flex items-center px-3 py-1 rounded-xl font-bold uppercase tracking-widest text-[9px] border ${
                        order.refundRequest.status === 'Approved' ? 'bg-green-900/20 border-green-500/30 text-green-400' :
                        order.refundRequest.status === 'Rejected' ? 'bg-red-900/20 border-red-500/30 text-red-400' :
                        'bg-yellow-900/20 border-yellow-500/30 text-yellow-400 animate-pulse'
                      }`}>
                        {order.refundRequest.status === 'Approved' ? 'Đã hoàn tiền' :
                         order.refundRequest.status === 'Rejected' ? 'Từ chối hoàn tiền' :
                         'Đang chờ xử lý'}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest">Số tiền hoàn</p>
                      <p className="font-black text-primary-400 text-base">{order.refundRequest.amount.toLocaleString('vi-VN')}₫</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest">Ngân hàng nhận</p>
                      <p className="font-black text-surface-900 uppercase text-base">{order.refundRequest.bankName}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest">Số tài khoản</p>
                      <p className="font-black text-surface-900 tracking-wider">{order.refundRequest.accountNumber}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest">Tên chủ tài khoản</p>
                      <p className="font-black text-surface-900 uppercase">{order.refundRequest.accountName}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest">Ngày yêu cầu</p>
                      <p className="font-bold text-surface-700">{new Date(order.refundRequest.createdAt).toLocaleString('vi-VN')}</p>
                    </div>
                    {order.refundRequest.reason && (
                      <div className="md:col-span-2 space-y-1">
                        <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest">Lý do huỷ đơn</p>
                        <p className="font-medium text-surface-700 italic">"{order.refundRequest.reason}"</p>
                      </div>
                    )}
                    {order.refundRequest.processedAt && (
                      <div className="md:col-span-2 space-y-1 pt-2 border-t border-surface-200/20">
                        <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest">Ngày xử lý hoàn tiền</p>
                        <p className="font-bold text-surface-900">{new Date(order.refundRequest.processedAt).toLocaleString('vi-VN')}</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Items Card */}
          <div className="bg-surface-100/30 backdrop-blur-xl rounded-[40px] border border-surface-200/20 p-8 space-y-6 shadow-xl shadow-black/5 hover:border-primary-500/20 transition-all duration-300">
            <h2 className="font-black text-surface-900 text-lg uppercase tracking-tight flex items-center gap-3">
              <div className="w-8 h-8 bg-surface-200/30 rounded-lg flex items-center justify-center text-primary-400"><ShoppingBag className="w-4 h-4" /></div>
              Sản phẩm ({order.items?.length})
            </h2>
            
            <div className="divide-y divide-surface-200/10">
              {order.items?.map(item => (
                <div key={item.id ?? item.productVariantId} className="py-6 flex flex-col sm:flex-row gap-6 first:pt-0 last:pb-0">
                  <div className="w-24 h-24 bg-surface-200/20 border border-surface-300/10 rounded-[20px] p-4 flex items-center justify-center flex-shrink-0">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-contain mix-blend-screen" />
                    ) : (
                      <Package className="w-8 h-8 text-surface-300 opacity-20" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="font-black text-surface-900 uppercase text-sm tracking-tight leading-tight">{item.productName}</p>
                    <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-surface-500">
                      <span>SL: {item.quantity}</span>
                      <span>Đơn giá: {item.priceAtPurchase.toLocaleString('vi-VN')}₫</span>
                    </div>
                    {['Delivered', 'Completed'].includes(order.status) && item.productId && (
                      <div className="pt-2">
                        {reviewedStatus[item.productId] === true ? (
                          <button
                            onClick={() => {
                              setSelectedItemForReview(item);
                              setReviewRating(5);
                              setReviewComment('');
                              setReviewImages([]);
                              setShowReviewModal(true);
                            }}
                            className="px-4 py-2 bg-primary-900/40 border border-primary-500/30 hover:bg-primary-900/60 text-primary-400 hover:text-white rounded-xl transition-all font-black uppercase tracking-widest text-[9px] flex items-center gap-2 active:scale-95"
                          >
                            <Star className="w-3.5 h-3.5 fill-current" />
                            Đánh giá sản phẩm
                          </button>
                        ) : reviewedStatus[item.productId] === false ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-200 text-surface-500 rounded-xl font-bold uppercase tracking-widest text-[9px]">
                            <Star className="w-3 h-3 fill-current text-surface-400" />
                            Đã đánh giá
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-200 text-surface-400 rounded-xl font-bold uppercase tracking-widest text-[9px] animate-pulse">
                            Đang tải...
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-primary-400 tracking-tighter">
                      {(item.priceAtPurchase * item.quantity).toLocaleString('vi-VN')}₫
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - SUMMARY BOX (Col: 4) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-surface-100/30 backdrop-blur-xl rounded-[40px] border border-surface-200/20 p-8 space-y-8 sticky top-28 shadow-xl shadow-black/5 hover:border-primary-500/20 transition-all duration-300">
            <h2 className="font-black text-surface-900 text-lg uppercase tracking-tight flex items-center gap-3">
              <div className="w-8 h-8 bg-surface-200/30 rounded-lg flex items-center justify-center text-primary-400"><CreditCard className="w-4 h-4" /></div>
              Sổ quỹ
            </h2>
            
            <div className="space-y-4 pt-2">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-surface-500">
                <span>Tổng giá trị</span>
                <span className="text-surface-900">{order.totalPrice.toLocaleString('vi-VN')}₫</span>
              </div>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-surface-500">
                <span>Khuyến mãi</span>
                <span className="text-accent-500">- 0₫</span>
              </div>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-surface-500">
                <span>Vận chuyển</span>
                <span className="text-green-500">FREESHIP</span>
              </div>
              
              <div className="h-px bg-surface-200/10 my-6" />
              
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-black uppercase text-surface-900 tracking-widest">Thực thu</span>
                <p className="text-3xl font-black text-primary-400 tracking-tighter">
                  {order.totalPrice.toLocaleString('vi-VN')}₫
                </p>
              </div>
            </div>

            {canCancel && (
              <button
                onClick={handleCancelClick}
                disabled={cancelling}
                className="w-full py-4 border-2 border-red-900/30 hover:bg-red-900/20 text-red-400 rounded-3xl transition-all font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 group active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <Ban className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                {cancelling ? 'Đang huỷ...' : 'Huỷ đơn hàng'}
              </button>
            )}
            
            <div className="pt-4 flex items-center justify-center gap-3">
              <Shield className="w-3 h-3 text-surface-500" />
              <span className="text-[10px] font-bold text-surface-500 uppercase tracking-[0.2em]">Verified Transaction</span>
            </div>
          </div>
        </div>
      </div>

      {/* STUNNING PREMIUM REFUND MODAL OVERLAY */}
      {showRefundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-950/85 backdrop-blur-sm transition-all duration-300">
          <div className="bg-surface-100 border border-surface-200 w-full max-w-lg rounded-[40px] p-8 md:p-10 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowRefundModal(false)}
              className="absolute top-6 right-6 text-surface-500 hover:text-surface-700 font-bold text-lg p-2"
            >
              ✕
            </button>
            
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-orange-900/20 border border-orange-500/20 text-orange-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                </div>
                <h3 className="text-2xl font-black text-surface-900 uppercase tracking-tight">
                  {isPaid ? "Yêu cầu hoàn tiền" : "Yêu cầu hủy đơn hàng (COD)"}
                </h3>
                <p className="text-xs font-bold text-surface-500 uppercase tracking-widest leading-relaxed">
                  {isPaid
                    ? "Đơn hàng đã được thanh toán. Vui lòng cung cấp tài khoản nhận hoàn quỹ."
                    : "Đơn hàng thanh toán khi nhận hàng. Vui lòng cung cấp lý do hủy đơn."}
                </p>
              </div>

              <form onSubmit={handleRefundSubmit} className="space-y-4">
                {isPaid && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-surface-500 uppercase tracking-widest">Ngân hàng nhận *</label>
                      <select
                        required
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full bg-surface-50 border border-surface-200 rounded-2xl px-5 py-4 text-sm font-bold text-surface-900 focus:outline-none focus:border-primary-500 transition-colors"
                      >
                        <option value="">-- Chọn Ngân Hàng --</option>
                        <option value="Vietcombank">Vietcombank</option>
                        <option value="Techcombank">Techcombank</option>
                        <option value="MB Bank">MB Bank</option>
                        <option value="VietinBank">VietinBank</option>
                        <option value="BIDV">BIDV</option>
                        <option value="Agribank">Agribank</option>
                        <option value="Momo">Ví Momo</option>
                        <option value="ZaloPay">Ví ZaloPay</option>
                        <option value="Khác">Khác (Nhập thủ công trong lý do)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-surface-500 uppercase tracking-widest">Số tài khoản nhận *</label>
                      <input
                        required
                        type="text"
                        placeholder="Nhập số tài khoản hoặc số điện thoại ví..."
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        className="w-full bg-surface-50 border border-surface-200 rounded-2xl px-5 py-4 text-sm font-bold text-surface-900 focus:outline-none focus:border-primary-500 transition-colors tracking-widest"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-surface-500 uppercase tracking-widest">Tên chủ tài khoản *</label>
                      <input
                        required
                        type="text"
                        placeholder="VIET HOA KHONG DAU..."
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value.toUpperCase())}
                        className="w-full bg-surface-50 border border-surface-200 rounded-2xl px-5 py-4 text-sm font-bold text-surface-900 focus:outline-none focus:border-primary-500 transition-colors uppercase tracking-wider"
                      />
                    </div>
                  </>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-surface-500 uppercase tracking-widest">Lý do huỷ đơn</label>
                  <textarea
                    required
                    placeholder="Vui lòng cho biết lý do để hệ thống cải thiện tốt hơn..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                    className="w-full bg-surface-50 border border-surface-200 rounded-2xl px-5 py-4 text-sm font-bold text-surface-900 focus:outline-none focus:border-primary-500 transition-colors"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowRefundModal(false)}
                    className="flex-1 py-4 border border-surface-300 text-surface-600 hover:bg-surface-200 rounded-3xl transition-colors font-black uppercase tracking-widest text-[10px]"
                  >
                    Bỏ qua
                  </button>
                  <button
                    type="submit"
                    disabled={cancelling}
                    className="flex-1 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-3xl transition-all font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary-950/20 active:scale-95 disabled:opacity-50"
                  >
                    {cancelling ? 'Đang gửi...' : 'Gửi yêu cầu hủy'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* STUNNING PREMIUM REVIEW MODAL OVERLAY */}
      {showReviewModal && selectedItemForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-950/85 backdrop-blur-sm transition-all duration-300">
          <div className="bg-surface-100 border border-surface-200 w-full max-w-lg rounded-[40px] p-8 md:p-10 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowReviewModal(false)}
              className="absolute top-6 right-6 text-surface-500 hover:text-surface-700 font-bold text-lg p-2"
            >
              ✕
            </button>
            
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-primary-900/20 border border-primary-500/20 text-primary-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Star className="w-6 h-6 fill-current text-primary-400" />
                </div>
                <h3 className="text-2xl font-black text-surface-900 uppercase tracking-tight">
                  Đánh giá sản phẩm
                </h3>
                <p className="text-xs font-bold text-surface-500 uppercase tracking-widest leading-relaxed truncate max-w-xs mx-auto">
                  {selectedItemForReview.productName}
                </p>
              </div>

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                {/* Star Rating Selector */}
                <div className="space-y-1 text-center">
                  <label className="text-[10px] font-black text-surface-500 uppercase tracking-widest block mb-2">Chất lượng sản phẩm *</label>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 focus:outline-none transition-all active:scale-95 duration-200"
                      >
                        <Star
                          className={`w-10 h-10 transition-colors duration-200 ${
                            star <= (hoverRating || reviewRating)
                              ? 'fill-yellow-500 text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]'
                              : 'text-surface-300 hover:text-yellow-400'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment Area */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-surface-500 uppercase tracking-widest">Nội dung đánh giá *</label>
                  <textarea
                    required
                    placeholder="Hãy chia sẻ cảm nhận của bạn về sản phẩm này nhé..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    rows={3}
                    className="w-full bg-surface-50 border border-surface-200 rounded-2xl px-5 py-4 text-sm font-bold text-surface-900 focus:outline-none focus:border-primary-500 transition-colors"
                  />
                </div>

                {/* Image Upload Area */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-surface-500 uppercase tracking-widest block">Hình ảnh thực tế</label>
                  
                  <div className="grid grid-cols-4 gap-3">
                    {/* Image thumbnails */}
                    {reviewImages.map((imgUrl, idx) => (
                      <div key={idx} className="relative aspect-square rounded-2xl bg-surface-50 border border-surface-200 overflow-hidden group">
                        <img src={imgUrl} alt="Review thumbnail" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-red-500"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                    
                    {/* Upload button */}
                    {reviewImages.length < 5 && (
                      <label className={`aspect-square rounded-2xl border-2 border-dashed border-surface-200 hover:border-primary-500 flex flex-col items-center justify-center cursor-pointer transition-colors ${uploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                          disabled={uploadingImage}
                        />
                        {uploadingImage ? (
                          <RefreshCw className="w-5 h-5 text-surface-400 animate-spin" />
                        ) : (
                          <>
                            <Camera className="w-5 h-5 text-surface-400" />
                            <span className="text-[8px] font-black text-surface-400 uppercase tracking-widest mt-1">Thêm ảnh</span>
                          </>
                        )}
                      </label>
                    )}
                  </div>
                  <p className="text-[9px] font-bold text-surface-400 uppercase tracking-widest">Tối đa 5 hình ảnh, dung lượng dưới 5MB/ảnh</p>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="flex-1 py-4 border border-surface-300 text-surface-600 hover:bg-surface-200 rounded-3xl transition-colors font-black uppercase tracking-widest text-[10px]"
                  >
                    Bỏ qua
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReview || uploadingImage}
                    className="flex-1 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-3xl transition-all font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary-950/20 active:scale-95 disabled:opacity-50"
                  >
                    {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailPage;
