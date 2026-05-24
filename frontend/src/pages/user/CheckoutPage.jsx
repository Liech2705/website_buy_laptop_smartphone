import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link, useSearchParams, useLocation } from 'react-router-dom';
import { clearCart, clearBuyNow } from '../../contexts/cartSlice';
import { createOrder } from '../../services/orderApi';
import { voucherApi } from '../../services/voucherApi';
import { getMyAddresses, createAddress, updateAddress } from '../../services/addressApi';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  User, Mail, Phone, MapPin, FileText, CreditCard, Truck,
  ShoppingBag, ChevronRight, AlertCircle, CheckCircle, Lock, Shield, Plus, Edit2, X,
  Tag, Loader2, Sparkles, Zap, ShieldCheck, Ticket, Wallet
} from 'lucide-react';
import { getProvinces, getDistricts, getWards } from '../../services/vnProvinceApi';
import { toast } from 'react-hot-toast';

const PAYMENT_METHODS = [
  { value: 'COD', label: 'Thanh toán khi nhận hàng (COD)', icon: Truck, desc: 'Trả tiền mặt khi nhận hàng' },
  { value: 'VNPAY', label: 'VNPAY - QR', icon: CreditCard, desc: 'Thanh toán qua VNPay / Thẻ ngân hàng' },
];

const isFreeshipVoucher = (voucher) => {
  if (!voucher) return false;
  const code = (voucher.code || '').toUpperCase();
  const desc = (voucher.description || '').toLowerCase();
  return code.includes('FS') || code.includes('FREE') || code.includes('SHIP') ||
         desc.includes('ship') || desc.includes('vận chuyển') || desc.includes('freeship');
};

const CheckoutPage = () => {
  const { items, totalPrice, buyNowItem } = useSelector(state => state.cart);
  const dispatch    = useDispatch();
  const navigate    = useNavigate();
  const location    = useLocation();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, user: currentUser } = useAuth();

  const isBuyNow = searchParams.get('mode') === 'buynow' && buyNowItem != null;
  const activeItems  = isBuyNow ? [{ ...buyNowItem, totalPrice: buyNowItem.price * buyNowItem.quantity }] : items;
  const activeTotal  = isBuyNow ? buyNowItem.price * buyNowItem.quantity : totalPrice;

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  const [form, setForm] = useState({
    fullName: currentUser?.fullName ?? '',
    email: currentUser?.email ?? '',
    phone: '',
    province: '',
    district: '',
    ward: '',
    detailAddress: '',
    note: '',
    paymentMethod: 'COD',
    isDefault: false,
  });

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  // Voucher Logic
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVouchers, setAppliedVouchers] = useState([]);
  const [validatingVoucher, setValidatingVoucher] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [myVouchers, setMyVouchers] = useState([]);

  // Shipping dynamic calculation
  const [shippingFee, setShippingFee] = useState(30000); // default 30k
  
  const activeAddress = (isAuthenticated && !showNewAddressForm)
    ? addresses.find(a => a.id === selectedAddressId)
    : form;
  const activeProvince = activeAddress?.province || '';

  useEffect(() => {
    const calculateShipping = async () => {
      if (!activeProvince) {
        setShippingFee(30000);
        return;
      }
      try {
        const res = await api.get('/shipping/calculate', { params: { province: activeProvince } });
        setShippingFee(res.fee ?? 30000);
      } catch (err) {
        // Fallback calculation logic on frontend in case API is not yet ready or errors
        const p = activeProvince.toLowerCase();
        if (p.includes('hà nội') || p.includes('hồ chí minh') || p.includes('hcm') || p.includes('hn')) {
          setShippingFee(20000);
        } else {
          setShippingFee(35000);
        }
      }
    };
    calculateShipping();
  }, [activeProvince]);
  
  // Separate product discount and shipping discount calculation
  const productDiscount = useMemo(() => {
    const prodVoucher = appliedVouchers.find(v => !isFreeshipVoucher(v));
    if (!prodVoucher) return 0;
    
    let discount = 0;
    if (prodVoucher.discountAmount != null) {
      discount = prodVoucher.discountAmount;
    } else if (prodVoucher.discountPercentage != null) {
      discount = activeTotal * (prodVoucher.discountPercentage / 100);
      if (prodVoucher.maxDiscountAmount != null) {
        discount = Math.min(discount, prodVoucher.maxDiscountAmount);
      }
    } else {
      discount = prodVoucher.discountAmount ?? 0;
    }
    return Math.min(discount, activeTotal);
  }, [appliedVouchers, activeTotal]);

  const shippingDiscount = useMemo(() => {
    const shipVoucher = appliedVouchers.find(v => isFreeshipVoucher(v));
    if (!shipVoucher) return 0;

    let discount = 0;
    if (shipVoucher.discountAmount != null) {
      discount = shipVoucher.discountAmount;
    } else if (shipVoucher.discountPercentage != null) {
      discount = shippingFee * (shipVoucher.discountPercentage / 100);
      if (shipVoucher.maxDiscountAmount != null) {
        discount = Math.min(discount, shipVoucher.maxDiscountAmount);
      }
    } else {
      discount = shipVoucher.discountAmount ?? shippingFee; // fully free if unspecified
    }
    return Math.min(discount, shippingFee);
  }, [appliedVouchers, shippingFee]);

  const grandTotal = activeTotal + shippingFee - productDiscount - shippingDiscount;

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để tiếp tục thanh toán');
      navigate('/login', { state: { from: location } });
    } else {
      fetchAddresses();
      fetchMyVouchers();
    }
    loadProvinces();
  }, [isAuthenticated, navigate, location]);

  const fetchMyVouchers = async () => {
    try {
      const data = await voucherApi.getMyVouchers();
      // UserVoucherDto has 'canUse' (computed) and 'voucherIsActive'
      // Show all vouchers, mark unusable ones (let user see them grayed out)
      setMyVouchers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch vouchers failed', err);
    }
  };

  const loadProvinces = async () => {
    try {
      const data = await getProvinces();
      setProvinces(data);
    } catch {}
  };

  const fetchAddresses = async () => {
    try {
      const res = await getMyAddresses();
      setAddresses(res);
      const defaultAddr = res.find(a => a.isDefault) || res[0];
      if (defaultAddr) setSelectedAddressId(defaultAddr.id);
      else setShowNewAddressForm(true);
    } catch {
      setShowNewAddressForm(true);
    }
  };

  const handleProvinceChange = async (e) => {
    const val = e.target.value;
    const province = provinces.find(p => p.name === val);
    setForm(prev => ({ ...prev, province: val, district: '', ward: '' }));
    setDistricts([]);
    setWards([]);
    if (province) {
      const data = await getDistricts(province.code);
      setDistricts(data);
    }
  };

  const handleDistrictChange = async (e) => {
    const val = e.target.value;
    const district = districts.find(d => d.name === val);
    setForm(prev => ({ ...prev, district: val, ward: '' }));
    setWards([]);
    if (district) {
      const data = await getWards(district.code);
      setWards(data);
    }
  };

  const handleApplyVoucher = async (codeToApply) => {
    const code = (typeof codeToApply === 'string' ? codeToApply : voucherCode).trim().toUpperCase();
    if (!code) return;
    if (!isAuthenticated) return toast.error('Đăng nhập để dùng mã giảm giá');

    setValidatingVoucher(true);
    try {
      const res = await voucherApi.validateVoucher(code, activeTotal);
      
      const isNewFreeShip = isFreeshipVoucher(res);
      
      setAppliedVouchers(prev => {
        // Filter out existing voucher of the SAME type
        const filtered = prev.filter(v => isFreeshipVoucher(v) !== isNewFreeShip);
        
        // Notify user about replacing
        const hasExistingSameType = prev.some(v => isFreeshipVoucher(v) === isNewFreeShip);
        if (hasExistingSameType) {
          toast.success(isNewFreeShip 
            ? 'Đã thay thế mã Freeship cũ bằng mã mới!' 
            : 'Đã thay thế mã giảm giá sản phẩm cũ bằng mã mới!'
          );
        } else {
          toast.success(isNewFreeShip 
            ? 'Đã áp dụng mã miễn phí vận chuyển!' 
            : 'Mã giảm giá đã được áp dụng!'
          );
        }
        
        return [...filtered, res];
      });

      setVoucherCode('');
      setShowVoucherModal(false);

      if (isAuthenticated) {
          try { 
              await voucherApi.saveVoucher(code); 
              fetchMyVouchers(); 
          } catch (e) {}
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Mã không khả dụng cho đơn hàng này');
    } finally {
      setValidatingVoucher(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (activeItems.length === 0) return toast.error('Giỏ hàng đang trống!');
    
    setLoading(true);
    try {
      let finalAddressId = selectedAddressId;
      if (showNewAddressForm) {
          const savedAddr = await createAddress(form);
          finalAddressId = savedAddr.id;
      }

      const dto = {
          paymentMethod: form.paymentMethod,
          note: form.note,
          existingAddressId: finalAddressId,
          items: activeItems.map(i => ({
              productVariantId: i.variantId ?? i.id,
              quantity: i.quantity,
              price: i.price,
          })),
          voucherCodes: appliedVouchers.map(v => v.code),
          isBuyNow,
          shippingFee: shippingFee
      };
      const order = await createOrder(dto);

      if (isBuyNow) dispatch(clearBuyNow()); else dispatch(clearCart());

      if (form.paymentMethod === 'VNPAY') {
        // api interceptor already unwraps response.data, so vnpayRes IS the response body
        const vnpayRes = await api.post('/payments/create-vnpay-url', { orderId: order.id });
        const url = vnpayRes?.paymentUrl || vnpayRes?.PaymentUrl;
        if (url) { window.location.href = url; return; }
      }
      navigate('/payment/success', { state: { order, paymentMethod: form.paymentMethod } });
    } catch (err) {
      setError(err?.response?.data?.message || 'Lỗi đặt hàng.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 pb-20 animate-in fade-in duration-1000">
      
      {/* HEADER */}
      <div className="relative overflow-hidden bg-white/[0.02] border-b border-white/5 pt-20 pb-16 mb-12">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/10 rounded-full blur-[120px] -mr-48 -mt-48" />
        <div className="container mx-auto px-4 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
                <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter italic leading-none mb-4">
                    Thanh <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-indigo-400 text-glow">Toán</span>
                </h1>
                <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-green-500" /> Hệ thống bảo mật Liechtop Shop
                </p>
            </div>
            <div className="hidden lg:flex items-center gap-8 bg-white/5 p-6 rounded-[32px] border border-white/5 backdrop-blur-md">
                <div className="text-right">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tài khoản thanh toán</p>
                    <p className="text-sm font-black text-white uppercase">{isAuthenticated ? currentUser.fullName : 'Guest'}</p>
                </div>
                <div className="w-12 h-12 bg-primary-600/20 rounded-2xl flex items-center justify-center"><User className="w-6 h-6 text-primary-400" /></div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* LEFT: FORM */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-white/[0.03] backdrop-blur-xl rounded-[40px] border border-white/10 p-10 space-y-10 shadow-2xl relative overflow-hidden group">
                <div className="relative flex items-center justify-between">
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic flex items-center gap-4">
                    <MapPin className="w-6 h-6 text-primary-400" /> Địa chỉ giao hàng
                  </h2>
                  {isAuthenticated && addresses.length > 0 && (
                    <button type="button" onClick={() => setShowNewAddressForm(!showNewAddressForm)} className="text-[10px] font-black text-primary-400 hover:text-white uppercase tracking-widest transition-all px-4 py-2 bg-white/5 rounded-full">
                      {showNewAddressForm ? 'Dùng địa chỉ đã lưu' : 'Thêm địa chỉ mới'}
                    </button>
                  )}
                </div>

                {isAuthenticated && !showNewAddressForm && addresses.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {addresses.map((addr) => (
                      <div key={addr.id} onClick={() => setSelectedAddressId(addr.id)} className={`p-8 rounded-[32px] border-2 transition-all cursor-pointer relative ${selectedAddressId === addr.id ? 'border-primary-500 bg-primary-600/10' : 'border-white/5 bg-white/[0.02] hover:border-white/20'}`}>
                        <p className="font-black text-lg text-white uppercase mb-2">{addr.fullName}</p>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{addr.phone}</p>
                        <p className="text-sm text-slate-400 leading-relaxed italic">{addr.detailAddress}, {addr.ward}, {addr.district}, {addr.province}</p>
                        {selectedAddressId === addr.id && <div className="absolute top-8 right-8 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center shadow-lg"><CheckCircle className="w-5 h-5 text-white" /></div>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-4 duration-500">
                    <div className="space-y-3"><label className="admin-form-label">Họ tên *</label><input name="fullName" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} required className="admin-form-input !bg-slate-900/50" /></div>
                    <div className="space-y-3"><label className="admin-form-label">SĐT *</label><input name="phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required className="admin-form-input !bg-slate-900/50" /></div>
                    <div className="md:col-span-2 space-y-3"><label className="admin-form-label">Email *</label><input name="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required className="admin-form-input !bg-slate-900/50" /></div>
                    <div className="space-y-3"><label className="admin-form-label">Tỉnh/Thành *</label><select name="province" value={form.province} onChange={handleProvinceChange} className="admin-form-select !bg-slate-900/50">{provinces.map(p => <option key={p.code} value={p.name}>{p.name}</option>)}</select></div>
                    <div className="space-y-3"><label className="admin-form-label">Quận/Huyện *</label><select name="district" value={form.district} onChange={handleDistrictChange} className="admin-form-select !bg-slate-900/50">{districts.map(d => <option key={d.code} value={d.name}>{d.name}</option>)}</select></div>
                    <div className="md:col-span-2 space-y-3"><label className="admin-form-label">Địa chỉ chi tiết *</label><input name="detailAddress" value={form.detailAddress} onChange={e => setForm({...form, detailAddress: e.target.value})} className="admin-form-input !bg-slate-900/50" /></div>
                  </div>
                )}
            </div>

            <div className="bg-white/[0.03] backdrop-blur-xl rounded-[40px] border border-white/10 p-10 space-y-8 shadow-2xl">
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic flex items-center gap-4"><CreditCard className="w-6 h-6 text-indigo-400" /> Thanh toán</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {PAYMENT_METHODS.map(m => (
                        <label key={m.value} className={`p-8 rounded-[32px] border-2 cursor-pointer transition-all flex flex-col gap-6 relative ${form.paymentMethod === m.value ? 'border-indigo-500 bg-indigo-600/10' : 'border-white/5 bg-white/[0.02] hover:border-white/20'}`}>
                            <input type="radio" name="paymentMethod" value={m.value} checked={form.paymentMethod === m.value} onChange={e => setForm({...form, paymentMethod: e.target.value})} className="sr-only" />
                            <m.icon className={`w-8 h-8 ${form.paymentMethod === m.value ? 'text-indigo-400' : 'text-slate-600'}`} />
                            <div><p className="font-black text-white uppercase tracking-tight">{m.label}</p><p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{m.desc}</p></div>
                        </label>
                    ))}
                </div>
            </div>
          </div>

          {/* RIGHT: BILL */}
          <div className="lg:col-span-5">
            <div className="bg-white/[0.04] backdrop-blur-2xl rounded-[48px] border border-white/10 p-10 sticky top-28 space-y-10 shadow-2xl">
                <div className="flex items-center justify-between pb-6 border-b border-white/5">
                    <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">Giỏ hàng ({activeItems.length})</h2>
                    <Zap className="w-5 h-5 text-amber-400 animate-pulse" />
                </div>

                <div className="space-y-6 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                    {activeItems.map(item => (
                        <div key={item.id} className="flex gap-6 items-center">
                            <div className="w-16 h-16 bg-slate-900 rounded-2xl border border-white/5 p-2"><img src={item.image} className="w-full h-full object-contain" /></div>
                            <div className="flex-1 min-w-0"><p className="text-xs font-black text-white uppercase truncate tracking-tight">{item.name}</p><p className="text-sm font-black text-primary-400 mt-1">{item.price.toLocaleString()}₫ <span className="text-[10px] text-slate-500 font-bold ml-2">x {item.quantity}</span></p></div>
                        </div>
                    ))}
                </div>

                {/* VOUCHER SECTION RESTORED */}
                <div className="space-y-4 p-6 bg-slate-900/80 rounded-[32px] border border-white/5 shadow-inner">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2"><Tag className="w-4 h-4 text-primary-400" /><span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mã giảm giá</span></div>
                        {isAuthenticated && (
                            <button type="button" onClick={() => setShowVoucherModal(true)} className="flex items-center gap-1 text-[10px] font-black text-primary-400 hover:text-white uppercase tracking-widest transition-all">
                                <Wallet className="w-3 h-3" /> Chọn từ ví
                            </button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <input value={voucherCode} onChange={e => setVoucherCode(e.target.value.toUpperCase())} placeholder="NHẬP MÃ TẠI ĐÂY" className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-xs font-black tracking-widest uppercase text-white placeholder:text-slate-700 outline-none focus:border-primary-500 transition-all" />
                        <button type="button" onClick={() => handleApplyVoucher(voucherCode)} disabled={validatingVoucher || !voucherCode} className="px-6 bg-primary-600 hover:bg-primary-500 text-white font-black text-[10px] rounded-2xl transition-all disabled:opacity-30">
                            {validatingVoucher ? <Loader2 className="w-4 h-4 animate-spin" /> : 'ÁP DỤNG'}
                        </button>
                    </div>
                    {appliedVouchers.length > 0 && (
                        <div className="space-y-2 mt-4">
                            {appliedVouchers.map(v => (
                                <div key={v.code} className="flex items-center justify-between p-4 bg-primary-600/10 border border-primary-500/30 rounded-2xl animate-in zoom-in-95">
                                     <div className="flex items-center gap-3">
                                        <Ticket className="w-5 h-5 text-primary-400" />
                                        <div>
                                            <p className="text-xs font-black text-white uppercase tracking-widest">{v.code}</p>
                                            <p className="text-[10px] text-primary-400 font-bold">Giảm {(v.discountAmount ?? 0).toLocaleString()}₫</p>
                                        </div>
                                     </div>
                                     <button type="button" onClick={() => setAppliedVouchers(prev => prev.filter(item => item.code !== v.code))} className="p-2 text-slate-500 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                    <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <span>Tạm tính</span>
                        <span className="text-white">{activeTotal.toLocaleString()}₫</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <span>Phí vận chuyển</span>
                        <span className="text-white">{shippingFee.toLocaleString()}₫</span>
                    </div>
                    {productDiscount > 0 && (
                        <div className="flex justify-between text-[10px] font-black text-primary-400 uppercase tracking-widest animate-in fade-in duration-300">
                            <span>Giảm giá sản phẩm</span>
                            <span>-{productDiscount.toLocaleString()}₫</span>
                        </div>
                    )}
                    {shippingDiscount > 0 && (
                        <div className="flex justify-between text-[10px] font-black text-green-400 uppercase tracking-widest animate-in fade-in duration-300">
                            <span>Giảm phí vận chuyển</span>
                            <span>-{shippingDiscount.toLocaleString()}₫</span>
                        </div>
                    )}
                    <div className="flex justify-between items-end pt-4">
                        <p className="text-xs font-black text-white uppercase tracking-widest">Thành tiền</p>
                        <p className="text-4xl font-black text-white tracking-tighter italic text-glow">{grandTotal.toLocaleString()}₫</p>
                    </div>
                </div>

                <button type="submit" disabled={loading} className="w-full py-6 bg-white text-black hover:bg-primary-400 hover:text-white transition-all font-black uppercase tracking-[0.3em] text-xs rounded-[28px] shadow-xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                    <span>{loading ? 'Hệ thống đang xử lý...' : (form.paymentMethod === 'VNPAY' ? 'Thanh toán VNPay' : 'Hoàn tất đặt hàng')}</span>
                </button>
            </div>
          </div>
        </form>
      </div>

      {/* VOUCHER MODAL RESTORED */}
      {showVoucherModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowVoucherModal(false)} />
            <div className="relative w-full max-w-lg bg-[#0f172a] rounded-[40px] border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Wallet className="w-5 h-5 text-primary-400" />
                        <h3 className="text-lg font-black text-white uppercase tracking-tighter italic">Ví Voucher của bạn</h3>
                    </div>
                    <button onClick={() => setShowVoucherModal(false)} className="p-2 text-slate-500 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
                </div>
                <div className="p-8 max-h-[400px] overflow-y-auto custom-scrollbar space-y-4">
                    {myVouchers.length === 0 ? (
                        <div className="text-center py-10">
                          <Ticket className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Ví của bạn đang trống</p>
                          <p className="text-slate-600 text-[10px] mt-2">Hãy lưu mã giảm giá vào ví trước</p>
                        </div>
                    ) : (
                        myVouchers.map(v => {
                          const notEnough = v.minOrderAmount > activeTotal;
                          const unusable  = !v.canUse || notEnough;
                          return (
                            <div
                              key={v.id}
                              onClick={() => !unusable && handleApplyVoucher(v.code)}
                              className={`group p-6 rounded-3xl border transition-all relative overflow-hidden ${
                                unusable
                                  ? 'border-white/5 bg-white/[0.01] opacity-50 cursor-not-allowed'
                                  : 'border-white/5 bg-white/[0.02] hover:border-primary-500/50 hover:bg-primary-600/5 cursor-pointer'
                              }`}
                            >
                              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10"><Ticket className="w-12 h-12" /></div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="px-3 py-1 bg-primary-600 text-white text-[9px] font-black rounded-lg uppercase tracking-widest">{v.code}</span>
                                <div className="flex items-center gap-2">
                                  {v.isUsed && <span className="text-[8px] font-black text-slate-500 uppercase italic">Đã dùng</span>}
                                  {!v.isUsed && v.isExpired && <span className="text-[8px] font-black text-red-400 uppercase italic">Hết hạn</span>}
                                  {!v.isUsed && !v.isExpired && notEnough && <span className="text-[8px] font-black text-amber-400 uppercase italic">Chưa đủ đk</span>}
                                </div>
                              </div>
                              <p className="text-sm font-black text-white uppercase tracking-tight">
                                Giảm {v.discountPercentage ? `${v.discountPercentage}%` : `${v.discountAmount?.toLocaleString()}₫`}
                                {v.maxDiscountAmount && v.discountPercentage ? <span className="text-[9px] text-slate-500 normal-case font-bold ml-1">(tối đa {v.maxDiscountAmount.toLocaleString()}₫)</span> : null}
                              </p>
                              {v.minOrderAmount > 0 && (
                                <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-1">
                                  Đơn tối thiểu {v.minOrderAmount.toLocaleString()}₫
                                  {notEnough && <span className="text-amber-500 ml-1">(thiếu {(v.minOrderAmount - activeTotal).toLocaleString()}₫)</span>}
                                </p>
                              )}
                              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-2 italic">
                                HSD: {v.expiryDate ? new Date(v.expiryDate).toLocaleDateString('vi-VN') : 'Không giới hạn'}
                              </p>
                            </div>
                          );
                        })
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
