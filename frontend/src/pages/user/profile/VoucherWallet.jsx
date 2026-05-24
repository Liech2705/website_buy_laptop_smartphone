import { useState, useEffect } from 'react';
import { voucherApi } from '../../../services/voucherApi';
import { toast } from 'react-hot-toast';
import { Ticket, Plus, Loader2, Search, Clock, Info } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const VoucherWallet = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const data = await voucherApi.getMyVouchers();
      setVouchers(data);
    } catch (error) {
      toast.error('Không thể tải ví voucher');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const handleSaveVoucher = async (e) => {
    e.preventDefault();
    if (!voucherCode.trim()) return toast.error('Vui lòng nhập mã voucher');

    setSaving(true);
    try {
      await voucherApi.saveVoucher(voucherCode.trim().toUpperCase());
      toast.success('Lưu voucher thành công!');
      setVoucherCode('');
      fetchVouchers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi lưu voucher');
    } finally {
      setSaving(false);
    }
  };

  const getDiscountText = (v) => {
    if (v.discountPercentage) {
      return `Giảm ${v.discountPercentage}%${v.maxDiscountAmount ? ` tối đa ${v.maxDiscountAmount.toLocaleString('vi-VN')}₫` : ''}`;
    }
    return `Giảm ${(v.discountAmount || 0).toLocaleString('vi-VN')}₫`;
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div>
        <h1 className="text-2xl font-black text-surface-900">Ví Voucher</h1>
        <p className="text-surface-500 mt-1 font-medium">Quản lý và lưu trữ các mã giảm giá của bạn</p>
      </div>

      {/* Save New Voucher */}
      <div className="bg-surface-100 rounded-3xl p-6 border border-surface-200 shadow-xl shadow-black/5">
        <h2 className="text-sm font-black uppercase text-surface-500 mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Thêm mã mới
        </h2>
        <form onSubmit={handleSaveVoucher} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
            <input
              type="text"
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value)}
              placeholder="Nhập mã voucher tại đây..."
              className="w-full pl-12 pr-4 py-4 bg-surface-200/50 border border-surface-300 rounded-2xl text-surface-900 placeholder-surface-500 focus:ring-2 focus:ring-primary-500 outline-none font-bold uppercase"
            />
          </div>
          <button
            type="submit"
            disabled={saving || !voucherCode.trim()}
            className="px-8 py-4 bg-primary-600 hover:bg-primary-700 disabled:bg-surface-300 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all shadow-lg shadow-primary-900/20 active:scale-95 flex justify-center items-center gap-2 whitespace-nowrap"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Lưu mã'}
          </button>
        </form>
      </div>

      {/* Voucher List */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-surface-900">Mã giảm giá của tôi</h2>
        
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : vouchers.length === 0 ? (
          <div className="bg-surface-100 rounded-3xl p-10 text-center border border-surface-200 border-dashed">
            <div className="w-16 h-16 bg-surface-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ticket className="w-8 h-8 text-surface-400" />
            </div>
            <h3 className="text-lg font-bold text-surface-900 mb-1">Ví trống</h3>
            <p className="text-surface-500">Bạn chưa lưu mã giảm giá nào.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vouchers.map((voucher) => (
              <div 
                key={voucher.id} 
                className={`relative overflow-hidden rounded-3xl border p-6 flex flex-col justify-between transition-all ${
                  voucher.canUse
                    ? 'bg-gradient-to-br from-surface-100 to-surface-50 border-primary-200 shadow-xl shadow-primary-900/5 hover:-translate-y-1'
                    : 'bg-surface-100 border-surface-200 opacity-60'
                }`}
              >
                {/* Status Badge */}
                {!voucher.canUse && (
                  <div className="absolute top-4 right-4 px-3 py-1 bg-surface-200 text-surface-600 text-xs font-bold rounded-full">
                    {voucher.isUsed ? 'Đã sử dụng' : voucher.isExpired ? 'Đã hết hạn' : 'Chưa đến hạn hoặc vô hiệu hóa'}
                  </div>
                )}
                {voucher.canUse && (
                  <div className="absolute top-4 right-4 px-3 py-1 bg-green-500/10 text-green-600 text-xs font-bold rounded-full">
                    Sẵn sàng
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${voucher.canUse ? 'bg-primary-100 text-primary-600' : 'bg-surface-200 text-surface-500'}`}>
                      <Ticket className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-black text-lg text-surface-900 uppercase tracking-wide">{voucher.code}</h3>
                    </div>
                  </div>
                  
                  <p className={`font-bold text-xl mb-1 ${voucher.canUse ? 'text-primary-600' : 'text-surface-600'}`}>
                    {getDiscountText(voucher)}
                  </p>
                  
                  <p className="text-sm text-surface-500 font-medium">
                    {voucher.description || `Đơn tối thiểu ${voucher.minOrderAmount.toLocaleString('vi-VN')}₫`}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-surface-200 flex items-center justify-between text-xs font-medium text-surface-500">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {voucher.expiryDate ? (
                      <span>HSD: {format(new Date(voucher.expiryDate), 'dd/MM/yyyy HH:mm', { locale: vi })}</span>
                    ) : (
                      <span>Không thời hạn</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VoucherWallet;
