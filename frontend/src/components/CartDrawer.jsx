import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { removeFromCart, updateQuantity, addToCart, toggleCartDrawer } from '../contexts/cartSlice';
import { resolveImageUrl } from '../utils/imageHelper';

const CartDrawer = () => {
  const { items, totalPrice, isCartDrawerOpen } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  if (!isCartDrawerOpen) return null;

  const handleClose = () => {
    dispatch(toggleCartDrawer(false));
  };

  const handleCheckout = () => {
    dispatch(toggleCartDrawer(false));
    navigate('/checkout');
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 transition-opacity animate-[fadeIn_0.3s_ease]"
        onClick={handleClose}
      />
      
      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full md:w-[450px] bg-surface-100 shadow-[0_0_100px_rgba(0,0,0,0.8)] z-50 flex flex-col transform transition-transform duration-500 border-l border-surface-200">
        
        {/* Header - Premium Dark */}
        <div className="flex items-center justify-between p-8 border-b border-surface-200">
          <div className="flex flex-col">
            <h2 className="text-2xl font-black text-surface-900 uppercase tracking-tighter flex items-center gap-3">
              <ShoppingBag className="w-7 h-7 text-primary-400" /> Giỏ hàng
            </h2>
            <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest mt-1">
              {items.length} Siêu phẩm đang chờ bạn
            </p>
          </div>
          <button 
            onClick={handleClose}
            className="w-12 h-12 flex items-center justify-center text-surface-400 hover:text-white hover:bg-surface-200 rounded-2xl transition-all group"
          >
            <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6 custom-scrollbar">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-[fadeIn_0.5s_ease]">
              <div className="w-32 h-32 bg-surface-200 rounded-[40px] flex items-center justify-center border border-surface-300 relative">
                <ShoppingBag className="w-16 h-16 text-surface-400" />
                <div className="absolute inset-0 bg-primary-600/5 rounded-[40px] blur-xl" />
              </div>
              <div className="space-y-2">
                <p className="text-xl font-black text-surface-900 uppercase tracking-tighter">Máy chưa có "hàng"</p>
                <p className="text-sm text-surface-500 max-w-[200px] mx-auto font-medium">Hãy duyệt qua danh mục sản phẩm của chúng tôi để bắt đầu.</p>
              </div>
              <button 
                onClick={handleClose}
                className="px-10 py-4 bg-primary-600 text-white rounded-2xl hover:bg-primary-700 transition-all font-black uppercase tracking-widest text-xs active:scale-95"
              >
                Khám phá ngay
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="group flex gap-5 bg-surface-200/30 p-5 rounded-[25px] border border-surface-200/50 hover:border-primary-500/30 transition-all relative overflow-hidden">
                  <div className="w-24 h-24 bg-surface-100 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0 border border-surface-200 p-2">
                    <img 
                      src={resolveImageUrl(item.image) || "https://placehold.co/150x150/0f172a/f8fafc?text=No+Image"} 
                      alt={item.name} 
                      className="w-full h-full object-contain mix-blend-screen scale-110 group-hover:scale-125 transition-transform duration-500" 
                      onError={e => { e.target.src = "https://placehold.co/150x150/0f172a/f8fafc?text=No+Image"; }}
                    />
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div className="space-y-1">
                      <h3 className="font-black text-xs uppercase tracking-tight text-surface-900 line-clamp-2 leading-tight group-hover:text-primary-400 transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-accent-500 font-black text-lg tracking-tighter">
                        {item.price.toLocaleString('vi-VN')}₫
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                      {/* Premium Quantity Control */}
                      <div className="flex items-center bg-surface-200 rounded-xl overflow-hidden border border-surface-300">
                        <button 
                          onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))}
                          className="w-8 h-8 flex items-center justify-center text-surface-900 hover:bg-primary-900/40 hover:text-primary-400 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-surface-900"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-1 text-[11px] font-black w-8 text-center text-surface-900">{item.quantity}</span>
                        <button 
                          onClick={() => dispatch(addToCart({ ...item, quantity: 1 }))}
                          disabled={item.stock != null && item.quantity >= item.stock}
                          className="w-8 h-8 flex items-center justify-center text-surface-900 hover:bg-primary-900/40 hover:text-primary-400 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-surface-900"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      
                      {/* Delete Icon */}
                      <button 
                        onClick={() => dispatch(removeFromCart(item.id))}
                        className="w-8 h-8 flex items-center justify-center text-red-400 hover:bg-red-950/30 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Subtle BG Glow on hover */}
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-primary-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer - Sticky Bottom */}
        {items.length > 0 && (
          <div className="p-8 bg-surface-100 border-t border-surface-200 space-y-6 shadow-[0_-20px_40px_rgba(0,0,0,0.4)]">
            <div className="space-y-4">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-surface-500">
                <span>Tạm tính ({items.length})</span>
                <span className="text-surface-900">{totalPrice.toLocaleString('vi-VN')}₫</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-surface-900 uppercase tracking-widest">Tổng cộng</span>
                <span className="text-3xl font-black text-primary-400 tracking-tighter">
                  {totalPrice.toLocaleString('vi-VN')}₫
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={handleCheckout}
                className="w-full bg-accent-500 hover:bg-accent-600 text-white font-black py-5 rounded-3xl transition-all shadow-xl shadow-accent-950/20 active:scale-[0.98] flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
              >
                Xác nhận đặt hàng <ArrowRight className="w-5 h-5" />
              </button>
              
              <div className="flex items-center justify-center gap-3 py-2">
                <ShieldCheck className="w-4 h-4 text-surface-400" />
                <span className="text-[9px] font-black text-surface-500 uppercase tracking-[0.3em]">Secure Checkout SSL</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
