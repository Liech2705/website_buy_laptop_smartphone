import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';
import { removeFromWishlist, clearWishlist } from '../../contexts/wishlistSlice';
import { addToCart, toggleCartDrawer } from '../../contexts/cartSlice';
import { resolveImageUrl } from '../../utils/imageHelper';

const WishlistPage = () => {
  const wishlistItems = useSelector(state => state.wishlist?.items || []);
  const dispatch = useDispatch();

  const handleRemove = (id) => {
    dispatch(removeFromWishlist(id));
  };

  const handleAddToCart = (item) => {
    dispatch(addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: resolveImageUrl(item.image),
      quantity: 1,
      stock: 10 // Mock stock as wishlist doesn't store full stock details
    }));
    dispatch(toggleCartDrawer(true));
  };

  return (
    <div className="bg-surface-50 min-h-screen pb-20">
      {/* Header Area */}
      <div className="bg-surface-100 border-b border-surface-200 py-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-600/5 rounded-full blur-[100px] -mr-48 -mt-48" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-900/10 border border-accent-500/20 rounded-full text-accent-500 text-[10px] font-black uppercase tracking-widest mb-6">
                <Heart className="w-3 h-3 fill-accent-500" /> Của riêng bạn
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-surface-900 uppercase tracking-tighter">
                Sản Phẩm Yêu Thích
              </h1>
            </div>
            {wishlistItems.length > 0 && (
              <button 
                onClick={() => dispatch(clearWishlist())}
                className="text-[10px] font-black uppercase tracking-widest text-surface-400 hover:text-red-500 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Xóa tất cả
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-12">
        {wishlistItems.length === 0 ? (
          <div className="bg-surface-100/20 backdrop-blur border border-dashed border-surface-200/50 rounded-[40px] p-20 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-surface-100/50 border border-white/5 rounded-full flex items-center justify-center mb-8">
              <Heart className="w-10 h-10 text-surface-400 fill-surface-400/10" />
            </div>
            <h2 className="text-2xl font-black text-surface-900 uppercase tracking-tight mb-4">Danh sách trống</h2>
            <p className="text-surface-400 mb-8 max-w-sm">Bạn chưa lưu sản phẩm nào. Hãy khám phá và lưu lại những món đồ công nghệ yêu thích của bạn nhé.</p>
            <Link to="/products" className="px-10 py-4 bg-primary-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary-700 transition-all shadow-xl shadow-primary-900/20 active:scale-95 flex items-center gap-2">
              Khám phá ngay <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map(item => (
              <div key={item.id} className="bg-surface-100/40 backdrop-blur border border-surface-200/50 rounded-[32px] p-4 hover:bg-surface-100/70 hover:border-primary-500/50 transition-all duration-300 group flex flex-col">
                <Link to={`/product/${item.id}`} className="aspect-square bg-surface-50/50 rounded-[24px] mb-6 p-6 relative flex items-center justify-center group-hover:bg-surface-100/50 transition-colors">
                  <img src={resolveImageUrl(item.image)} alt={item.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" onError={e => { e.target.src = `https://placehold.co/300x300/0f172a/f8fafc?text=IMG`; }} />
                  
                  {/* Remove Button Overlay */}
                  <button 
                    onClick={(e) => { e.preventDefault(); handleRemove(item.id); }}
                    className="absolute top-4 right-4 w-10 h-10 bg-black/40 backdrop-blur border border-white/10 rounded-full flex items-center justify-center text-accent-500 hover:text-red-500 hover:bg-black/60 hover:border-red-500/30 transition-all z-10 animate-pulse-subtle"
                  >
                    <Heart className="w-5 h-5 fill-current" />
                  </button>
                </Link>

                <div className="flex-1 flex flex-col px-2">
                  <Link to={`/product/${item.id}`} className="font-bold text-surface-900 line-clamp-2 leading-tight hover:text-primary-400 transition-colors mb-4 flex-1 text-sm">
                    {item.name}
                  </Link>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-surface-200/50">
                    <p className="font-black text-accent-500 text-lg">
                      {item.price.toLocaleString('vi-VN')}₫
                    </p>
                    <button 
                      onClick={() => handleAddToCart(item)}
                      className="w-10 h-10 bg-white text-black rounded-xl flex items-center justify-center hover:bg-primary-500 hover:text-white transition-all active:scale-95 shadow-lg shadow-black/10"
                    >
                      <ShoppingBag className="w-4 h-4" />
                    </button>
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

export default WishlistPage;
