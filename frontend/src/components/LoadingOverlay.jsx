import React, { useEffect } from 'react';

const LoadingOverlay = ({ message = 'Đang xử lý...' }) => {
  // Chặn thoát trang hoặc tải lại trang khi đang loading
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = ''; // Hiển thị cảnh báo mặc định của trình duyệt
    };

    const handlePopState = (e) => {
      // Chặn nút Back của trình duyệt
      window.history.pushState(null, '', window.location.href);
      alert("Hệ thống đang xử lý quan trọng, vui lòng không quay lại lúc này!");
    };

    // Khóa trạng thái lịch sử để nút Back không hoạt động
    window.history.pushState(null, '', window.location.href);
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-[#020617]/90 backdrop-blur-xl transition-all duration-300 animate-in fade-in">
      {/* Cấm mọi tương tác chuột/bàn phím bên dưới */}
      <div className="absolute inset-0 cursor-wait" />

      <div className="relative">
        {/* Outer Glow */}
        <div className="absolute inset-0 bg-primary-500/30 rounded-full blur-3xl animate-pulse" />
        
        {/* Complex Spinner */}
        <div className="relative w-24 h-24">
            <div className="absolute inset-0 border-8 border-surface-300/10 rounded-full" />
            <div className="absolute inset-0 border-8 border-t-primary-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
            <div className="absolute inset-4 border-4 border-surface-300/10 rounded-full" />
            <div className="absolute inset-4 border-4 border-b-accent-500 border-t-transparent border-r-transparent border-l-transparent rounded-full animate-spin-slow" />
        </div>
        
        {/* Inner Pulsing Core */}
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 bg-primary-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-ping" />
        </div>
      </div>
      
      <div className="mt-10 text-center space-y-3 px-6 relative z-10">
        <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic drop-shadow-2xl">
            {message}
        </h3>
        <div className="flex items-center justify-center gap-1.5">
            {[0, 1, 2].map((i) => (
                <div 
                    key={i} 
                    className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" 
                    style={{ animationDelay: `${i * 0.15}s` }} 
                />
            ))}
        </div>
        <p className="text-surface-400 font-bold text-[10px] uppercase tracking-[0.3em] bg-surface-900/50 py-2 px-4 rounded-full border border-surface-800">
            Hệ thống đang thiết lập kết nối bảo mật. Vui lòng đợi...
        </p>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin-slow {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}} />
    </div>
  );
};

export default LoadingOverlay;
