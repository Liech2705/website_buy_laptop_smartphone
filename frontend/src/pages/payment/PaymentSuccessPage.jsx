import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import { useDispatch } from 'react-redux';
// Assuming we have a clearCart action in future, but for now we manually clear or just simulate
// import { clearCart } from '../../contexts/cartSlice';

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  
  // Extract info from query params if returning from VNPAY
  const orderId = searchParams.get('vnp_TxnRef') || Math.floor(Math.random() * 1000000);
  const amount = searchParams.get('vnp_Amount') ? (parseInt(searchParams.get('vnp_Amount')) / 100) : null;
  const responseCode = searchParams.get('vnp_ResponseCode');

  useEffect(() => {
    if (responseCode && responseCode !== '00') {
        navigate('/payment/fail');
    }
    // dispatch(clearCart());
  }, [responseCode, navigate, dispatch]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-surface-50 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden text-center relative border border-surface-200">
        
        {/* Top decoration */}
        <div className="h-32 bg-gradient-to-r from-teal-400 to-emerald-500 absolute top-0 left-0 w-full"></div>
        
        <div className="relative pt-20 px-8 pb-8">
          {/* Icon */}
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto shadow-lg mb-6 border-4 border-emerald-50 text-emerald-500 relative z-10">
            <CheckCircle className="w-12 h-12" />
          </div>
          
          <h1 className="text-3xl font-extrabold text-surface-900 mb-2">Đặt hàng thành công!</h1>
          <p className="text-surface-500 mb-8 font-medium px-4">
            Cảm ơn bạn đã mua sắm tại LiechtopShop. Đơn hàng của bạn đang được xử lý.
          </p>

          {/* Order Info Card */}
          <div className="bg-surface-50 rounded-2xl p-4 mb-8 text-left border border-surface-200">
            <div className="flex justify-between items-center mb-3">
              <span className="text-surface-500 text-sm">Mã đơn hàng:</span>
              <span className="font-bold text-surface-900">#{orderId}</span>
            </div>
            {amount && (
              <div className="flex justify-between items-center mb-3">
                <span className="text-surface-500 text-sm">Tổng tiền:</span>
                <span className="font-bold text-surface-900">{amount.toLocaleString('vi-VN')} đ</span>
              </div>
            )}
            <div className="flex justify-between items-center pb-2">
              <span className="text-surface-500 text-sm">Thanh toán:</span>
              <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Thành công</span>
            </div>
          </div>

          <div className="space-y-3">
            <button 
              onClick={() => navigate('/profile/orders')} 
              className="w-full py-3.5 bg-surface-900 text-white font-bold rounded-xl hover:bg-surface-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Package className="w-5 h-5"/> Theo dõi đơn hàng
            </button>
            <button 
              onClick={() => navigate('/products')} 
              className="w-full py-3.5 bg-surface-100 hover:bg-surface-200 text-surface-900 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              Tiếp tục mua sắm <ArrowRight className="w-5 h-5"/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
