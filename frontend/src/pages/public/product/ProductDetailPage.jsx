import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, setBuyNow, toggleCartDrawer } from '../../../contexts/cartSlice';
import { toggleWishlist } from '../../../contexts/wishlistSlice';
import { getProductById } from '../../../services/productApi';
import { getReviewsByProduct } from '../../../services/reviewApi';
import { ShoppingCart, ArrowLeft, Star, Shield, Clock, CreditCard, CheckCircle, Share2, Heart, ChevronRight, X } from 'lucide-react';
import { resolveImageUrl } from '../../../utils/imageHelper';

const ProductDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [addedMsg, setAddedMsg] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getProductById(id);
        setProduct(data);
        if (data?.variants?.length > 0) setSelectedVariant(data.variants[0]);
        setActiveImg(0);
      } catch {
        setError('Không tìm thấy sản phẩm hoặc có lỗi xảy ra.');
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      setReviewsLoading(true);
      try {
        const data = await getReviewsByProduct(id);
        setReviews(data || []);
      } catch (err) {
        console.error("Lỗi khi tải đánh giá sản phẩm", err);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetch();
    fetchReviews();
  }, [id]);

  const stock = selectedVariant?.stock ?? 0;

  const handleAddToCart = () => {
    if (!product) return;
    if (stock <= 0) return;
    dispatch(addToCart({
      id:        selectedVariant?.id ?? product.id,
      name:      product.name + (selectedVariant?.sku ? ` (${selectedVariant.sku})` : ''),
      price:     selectedVariant?.price ?? product.basePrice ?? 0,
      image:     resolveImageUrl(product.imageUrls?.[0]) ?? '',
      variantId: selectedVariant?.id,
      stock,
    }));
    dispatch(toggleCartDrawer(true));
    setAddedMsg(true);
    setTimeout(() => setAddedMsg(false), 2500);
  };

  // Buy Now — navigate to checkout with ONLY this product, cart is untouched
  const handleBuyNow = () => {
    if (!product) return;
    if (stock <= 0) return;
    dispatch(setBuyNow({
      id:        selectedVariant?.id ?? product.id,
      name:      product.name + (selectedVariant?.sku ? ` (${selectedVariant.sku})` : ''),
      price:     selectedVariant?.price ?? product.basePrice ?? 0,
      image:     resolveImageUrl(product.imageUrls?.[0]) ?? '',
      variantId: selectedVariant?.id,
      quantity:  quantity,
      stock,
    }));
    navigate('/checkout?mode=buynow');
  };

  const currentPrice = selectedVariant?.price ?? product?.basePrice ?? 0;
  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : 5.0;
  // Use high-quality dark themed placeholder if no image
  const images = product?.imageUrls?.length > 0
    ? product.imageUrls.map(resolveImageUrl)
    : [`https://placehold.co/800x800/0f172a/f8fafc?text=${encodeURIComponent(product?.name ?? 'Product')}`];

  const wishlistItems = useSelector(state => state.wishlist?.items || []);
  const isWishlisted = product && Array.isArray(wishlistItems) ? wishlistItems.some(item => item.id === product.id) : false;

  const handleToggleWishlist = () => {
    if (!product) return;
    dispatch(toggleWishlist({
      id: product.id,
      name: product.name,
      price: currentPrice,
      image: images[0]
    }));
  };

  if (loading) return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-primary-900/30 rounded-full" />
          <div className="absolute inset-0 border-4 border-t-primary-500 rounded-full animate-spin" />
        </div>
        <p className="text-surface-400 font-bold tracking-widest uppercase text-xs animate-pulse">Đang tải sản phẩm...</p>
      </div>
    </div>
  );

  if (error || !product) return (
    <div className="min-h-screen bg-surface-50 flex flex-col items-center justify-center gap-8 px-4">
      <div className="w-24 h-24 bg-surface-100 rounded-3xl flex items-center justify-center border border-surface-200">
        <Shield className="w-12 h-12 text-surface-300 opacity-20" />
      </div>
      <div className="text-center">
        <h2 className="text-2xl font-black text-surface-900 mb-2 uppercase tracking-tight">Lỗi không mong muốn</h2>
        <p className="text-surface-500 max-w-sm mx-auto">{error ?? 'Sản phẩm này hiện đang được cập nhật hoặc không tồn tại.'}</p>
      </div>
      <Link to="/products" className="px-8 py-4 bg-primary-600 text-white font-black rounded-2xl hover:bg-primary-700 transition-all shadow-xl shadow-primary-900/20 active:scale-95">
        QUAY LẠI CỬA HÀNG
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface-50 pb-20">
      {/* Top Navigation / Breadcrumb */}
      <div className="bg-surface-100/50 border-b border-surface-200 py-4 sticky top-16 z-20 backdrop-blur-md">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-surface-500 overflow-hidden">
            <Link to="/" className="hover:text-primary-400 transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/products" className="hover:text-primary-400 transition-colors">Store</Link>
            {product.parentCategoryName && (
              <>
                <ChevronRight className="w-3 h-3" />
                <Link to={`/products?category=${product.parentCategoryId}`} className="hover:text-primary-400 transition-colors">
                  {product.parentCategoryName}
                </Link>
              </>
            )}
            {product.categoryName && (
              <>
                <ChevronRight className="w-3 h-3" />
                <Link to={`/products?category=${product.categoryId}`} className="hover:text-primary-400 transition-colors">
                  {product.categoryName}
                </Link>
              </>
            )}
            <ChevronRight className="w-3 h-3" />
            <span className="text-surface-900 truncate max-w-[150px]">{product.name}</span>
          </nav>
          <div className="flex items-center gap-4">
            <button className="text-surface-400 hover:text-white transition-colors"><Share2 className="w-5 h-5" /></button>
            <button onClick={handleToggleWishlist} className={`transition-colors ${isWishlisted ? 'text-accent-500' : 'text-surface-400 hover:text-accent-500'}`}>
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-accent-500' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* LEFT: Image System (Col: 7) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="aspect-[4/3] bg-surface-100 rounded-[40px] border border-surface-200 flex items-center justify-center overflow-hidden group relative p-8 shadow-inner shadow-black/20">
              {/* Product Glow BG */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-600/5 via-transparent to-accent-600/5" />
              
              <img
                src={images[activeImg]}
                alt={product.name}
                className="object-contain w-full h-full mix-blend-screen transition-transform duration-700 group-hover:scale-110 relative z-10"
                onError={e => { e.target.src = 'https://placehold.co/800x800/0f172a/f8fafc?text=Liechtop'; }}
              />
              
              {/* Floating Badge */}
              <div className="absolute top-8 right-8 bg-surface-900/10 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-2">
                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                <span className="text-sm font-black text-white">{reviews.length > 0 ? averageRating : '5.0'}</span>
              </div>
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-3 gap-4">
                {images.slice(0, 3).map((img, i) => {
                  const isThird = i === 2;
                  const hasMore = images.length > 4;
                  const remainingCount = images.length - 3;
                  
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        if (isThird && hasMore) {
                          setIsLightboxOpen(true);
                        } else {
                          setActiveImg(i);
                        }
                      }}
                      className={`relative aspect-square rounded-2xl border-2 transition-all p-2 bg-slate-900 overflow-hidden group ${
                        activeImg === i && !(isThird && hasMore) ? 'border-primary-500 shadow-lg shadow-primary-500/20' : 'border-surface-200 hover:border-surface-300'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-contain mix-blend-screen transition-transform duration-300 group-hover:scale-105" />
                      
                      {isThird && hasMore && (
                        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px] flex items-center justify-center transition-all group-hover:bg-slate-950/70">
                          <span className="text-white text-lg font-black tracking-wider">
                            +{remainingCount}
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT: Specs & Purchase (Col: 5) */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {product.brandName && (
                  <span className="text-[10px] font-black px-3 py-1 bg-primary-900/50 text-sky-400 rounded-full border border-sky-400/20 uppercase tracking-widest">
                    {product.brandName}
                  </span>
                )}
                {product.parentCategoryName && (
                  <span className="text-[10px] font-black px-3 py-1 bg-surface-200 text-surface-500 rounded-full uppercase tracking-widest">
                    {product.parentCategoryName}
                  </span>
                )}
                {product.categoryName && 
                 product.categoryName.toLowerCase() !== product.brandName?.toLowerCase() && 
                 product.categoryName.toLowerCase() !== product.parentCategoryName?.toLowerCase() && (
                  <span className="text-[10px] font-black px-3 py-1 bg-surface-200 text-surface-500 rounded-full uppercase tracking-widest">
                    {product.categoryName}
                  </span>
                )}
              </div>
              
              <h1 className="text-3xl md:text-5xl font-black text-surface-900 leading-tight tracking-tighter uppercase">
                {product.name}
              </h1>
              
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-surface-500 uppercase tracking-widest">Giá niêm yết:</span>
                <p className="text-5xl font-black text-accent-500 tracking-tight">
                  {currentPrice.toLocaleString('vi-VN')}
                  <span className="text-2xl ml-1">₫</span>
                </p>
              </div>
            </div>

            <div className="h-px bg-surface-200 w-full" />

            {/* Selection - Variants */}
            {product.variants?.length > 0 && (
              <div className="space-y-4">
                <p className="font-black text-surface-400 text-xs uppercase tracking-widest">Lựa chọn phiên bản:</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map(v => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={`px-5 py-3 rounded-2xl border-2 font-bold transition-all text-sm ${
                        selectedVariant?.id === v.id
                          ? 'border-primary-500 bg-primary-900/20 text-surface-900'
                          : 'border-surface-200 text-surface-500 hover:border-surface-300'
                      }`}
                    >
                      {v.sku}
                      <span className={`block text-[10px] uppercase tracking-tighter mt-0.5 ${selectedVariant?.id === v.id ? 'text-primary-400' : 'text-surface-400'}`}>
                        {v.price.toLocaleString('vi-VN')}₫
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Selection - Quantity */}
            <div className="space-y-4">
              <p className="font-black text-surface-400 text-xs uppercase tracking-widest">Số lượng mua:</p>
              <div className="flex items-center bg-surface-100 border border-surface-200 rounded-2xl p-1 w-fit">
                <button 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={stock <= 0}
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold text-surface-400 hover:bg-surface-200 transition-colors disabled:opacity-20"
                >−</button>
                <span className="w-16 text-center font-black text-xl text-surface-900">{quantity}</span>
                <button 
                  onClick={() => setQuantity(q => Math.min(stock, q + 1))}
                  disabled={stock <= 0 || quantity >= stock}
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold text-surface-400 hover:bg-surface-200 transition-colors disabled:opacity-20"
                >+</button>
              </div>
              {stock > 0 && <p className="text-[10px] font-bold text-surface-500 uppercase tracking-widest ml-1">Còn lại: {stock} sản phẩm</p>}
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-col gap-4 pt-4">
              <button
                onClick={handleAddToCart}
                disabled={stock <= 0}
                className="w-full py-5 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-black rounded-3xl transition-all shadow-xl shadow-accent-950/20 active:scale-95 flex items-center justify-center gap-3 uppercase tracking-wider disabled:opacity-50 disabled:from-surface-300 disabled:to-surface-400 disabled:shadow-none"
              >
                <ShoppingCart className="w-6 h-6" />
                {stock <= 0 ? 'Hết hàng' : (addedMsg ? 'Đã thêm thành công!' : 'Thêm vào giỏ hàng')}
              </button>
              
              <button
                onClick={handleBuyNow}
                disabled={stock <= 0}
                className="w-full py-5 bg-surface-900 text-surface-50 font-black rounded-3xl transition-all hover:bg-white hover:text-black flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50 disabled:bg-surface-300 disabled:text-surface-500"
              >
                {stock <= 0 ? 'HẾT HÀNG' : 'MUA NGAY BÂY GIỜ'}
              </button>
            </div>

            {/* Features / Trust */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Shield, title: 'Chính hãng', desc: 'Cam kết 100%' },
                { icon: Clock, title: 'Siêu tốc', desc: 'Giao hàng 2h' },
                { icon: CreditCard, title: 'Linh hoạt', desc: 'Trả góp 0%' },
                { icon: CheckCircle, title: 'Bản quyền', desc: 'Microsoft' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-center gap-4 p-4 bg-surface-100/50 border border-surface-200 rounded-3xl">
                  <div className="w-10 h-10 rounded-xl bg-primary-900/30 flex items-center justify-center text-primary-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-surface-400 tracking-tighter">{title}</p>
                    <p className="text-xs font-bold text-surface-900">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Detailed Description */}
            {product.description && (
              <div className="bg-surface-100 border border-surface-200 rounded-[30px] p-8 space-y-4">
                <h3 className="text-lg font-black text-surface-900 uppercase tracking-tight">Chi tiết sản phẩm</h3>
                <div className="w-12 h-1 bg-primary-600 rounded-full" />
                <p className="text-surface-500 text-sm leading-relaxed whitespace-pre-line font-medium">
                  {product.description}
                </p>
              </div>
            )}

            {/* Technical Specifications */}
            {product.attributes && product.attributes.length > 0 && (
              <div className="bg-surface-100 border border-surface-200 rounded-[30px] p-8 space-y-4">
                <h3 className="text-lg font-black text-surface-900 uppercase tracking-tight">Thông số kỹ thuật</h3>
                <div className="w-12 h-1 bg-primary-600 rounded-full" />
                <div className="divide-y divide-surface-200/10">
                  {product.attributes.map((attr, index) => (
                    <div key={index} className="grid grid-cols-3 py-3.5 text-sm border-b border-surface-200/30 last:border-0">
                      <span className="text-surface-400 font-bold uppercase tracking-wider text-xs">{attr.name}</span>
                      <span className="col-span-2 text-surface-900 font-semibold pl-4">{attr.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* REVIEWS SECTION */}
        <div className="mt-16 bg-surface-100 border border-surface-200 rounded-[30px] p-8 md:p-12 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-surface-200/20 pb-8">
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-black text-surface-900 uppercase tracking-tight">Đánh giá từ khách hàng</h2>
              <div className="w-16 h-1 bg-primary-600 rounded-full" />
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-center md:text-right">
                <p className="text-5xl font-black text-white tracking-tight">{reviews.length > 0 ? averageRating : '5.0'}<span className="text-2xl text-surface-400">/5</span></p>
                <div className="flex items-center gap-1 mt-1 justify-center md:justify-end">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= Math.round(reviews.length > 0 ? averageRating : 5)
                          ? 'fill-yellow-500 text-yellow-500'
                          : 'text-surface-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[10px] font-black uppercase text-surface-400 tracking-widest mt-1">Dựa trên {reviews.length} lượt đánh giá</p>
              </div>
            </div>
          </div>

          {reviewsLoading ? (
            <div className="py-12 flex justify-center">
              <div className="w-10 h-10 border-4 border-primary-900/30 border-t-primary-500 rounded-full animate-spin" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 bg-surface-200/30 rounded-2xl flex items-center justify-center mx-auto text-surface-300 opacity-20 border border-surface-200">
                <Star className="w-8 h-8" />
              </div>
              <p className="text-sm font-bold text-surface-400 uppercase tracking-widest">Chưa có đánh giá nào cho sản phẩm này.</p>
              <p className="text-xs text-surface-500">Hãy là khách hàng đầu tiên mua và trải nghiệm để đánh giá sản phẩm!</p>
            </div>
          ) : (
            <div className="divide-y divide-surface-200/10">
              {reviews.map((rev) => (
                <div key={rev.id} className="py-8 first:pt-0 last:pb-0 space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-900/40 border border-primary-500/20 flex items-center justify-center text-primary-400 font-black text-sm uppercase">
                        {rev.userName?.slice(0, 2) || 'KH'}
                      </div>
                      <div>
                        <p className="font-black text-surface-900 text-sm uppercase tracking-wider">{rev.userName || 'Khách hàng'}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3 h-3 ${
                                star <= rev.rating ? 'fill-yellow-500 text-yellow-500' : 'text-surface-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <span className="text-[10px] font-bold text-surface-500 uppercase tracking-widest">
                      {new Date(rev.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>

                  <p className="text-surface-700 font-medium text-sm leading-relaxed whitespace-pre-line pl-1">
                    {rev.comment}
                  </p>

                  {rev.imageUrls?.length > 0 && (
                    <div className="flex flex-wrap gap-3 pt-2 pl-1">
                      {rev.imageUrls.map((imgUrl, i) => (
                        <div
                          key={i}
                          className="w-20 h-20 rounded-2xl bg-surface-50 border border-surface-200 overflow-hidden cursor-pointer hover:scale-105 hover:border-primary-500 transition-all duration-300 shadow-lg shadow-black/10"
                          onClick={() => {
                            window.open(imgUrl, '_blank');
                          }}
                        >
                          <img src={imgUrl} alt="Review attachment" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RELATED / FOOTER ACTION */}
        <div className="mt-20 flex justify-center">
          <Link to="/products" className="inline-flex items-center gap-3 text-primary-400 hover:text-white font-bold uppercase tracking-widest transition-all">
            <ArrowLeft className="w-5 h-5" /> Trở về cửa hàng
          </Link>
        </div>
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[9999] flex flex-col items-center justify-center p-4 animate-in fade-in duration-300">
          <button 
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all active:scale-95 border border-white/10"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="w-full max-w-4xl aspect-[4/3] flex items-center justify-center p-4">
            <img 
              src={images[activeImg]} 
              alt={product.name} 
              className="max-w-full max-h-full object-contain mix-blend-screen drop-shadow-[0_0_50px_rgba(37,99,235,0.3)] animate-in zoom-in-95 duration-300"
            />
          </div>
          
          {/* Lightbox thumbnails */}
          <div className="mt-8 flex gap-3 overflow-x-auto pb-2 max-w-full px-4">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImg(idx)}
                className={`w-20 h-20 rounded-xl border-2 p-2 bg-slate-900 flex-shrink-0 transition-all ${
                  activeImg === idx ? 'border-primary-500 scale-105 shadow-lg shadow-primary-500/20' : 'border-surface-200 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-contain mix-blend-screen" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
