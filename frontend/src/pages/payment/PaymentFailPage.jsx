import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle, RefreshCw, Home } from 'lucide-react';

const PaymentFailPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const errorMessage = searchParams.get('vnp_ResponseCode') === '24' ? "Giao dịch bị huỷ bởi người dùng" : "Giao dịch thất bại hoặc bị từ chối bởi ngân hàng";

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-surface-50 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden text-center relative border border-surface-200">
        
        {/* Top decoration */}
        <div className="h-32 bg-gradient-to-r from-red-500 to-rose-600 absolute top-0 left-0 w-full"></div>
        
        <div className="relative pt-20 px-8 pb-8">
          {/* Icon */}
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto shadow-lg mb-6 border-4 border-red-50 text-red-500 relative z-10">
            <XCircle className="w-12 h-12" />
          </div>
          
          <h1 className="text-3xl font-extrabold text-surface-900 mb-2">Thanh toán thất bại</h1>
          <p className="text-surface-500 mb-8 font-medium px-4">
            Đơn hàng của bạn chưa được thanh toán thành công. <br/>
            <span className="text-red-500">{errorMessage}</span>
          </p>

          <div className="space-y-3">
            <button 
              onClick={() => navigate('/checkout')} 
              className="w-full py-3.5 bg-accent-600 hover:bg-accent-500 text-white font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-5 h-5"/> Thử thanh toán lại
            </button>
            <button 
              onClick={() => navigate('/')} 
              className="w-full py-3.5 bg-surface-100 hover:bg-surface-200 text-surface-900 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Home className="w-5 h-5"/> Về trang chủ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailPage;
