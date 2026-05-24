import { Link } from 'react-router-dom';
import { Facebook, Instagram, Youtube, Twitter, ShieldCheck, CreditCard, Truck, Zap, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#020617] text-surface-400 pt-24 pb-12 relative overflow-hidden border-t border-white/5">
      {/* Decorative Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-600/5 rounded-full blur-[120px]" />
      
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-20">
          
          {/* Brand & Mission (Col: 4) */}
          <div className="lg:col-span-4 space-y-8">
            <Link to="/" className="inline-block group">
              <span className="text-3xl font-black bg-gradient-to-r from-white via-primary-400 to-white bg-clip-text text-transparent uppercase italic tracking-tighter leading-none group-hover:tracking-normal transition-all duration-500">
                Liechtop
              </span>
              <p className="text-[9px] font-black tracking-[0.4em] text-primary-500 uppercase mt-1">Authorized Reseller</p>
            </Link>
            <p className="text-sm text-surface-500 leading-relaxed max-w-sm font-medium">
              Tiên phong trong việc cung cấp các giải pháp công nghệ cao cấp. Chúng tôi cam kết mang đến trải nghiệm số vượt trội với các dòng Laptop, Smartphone và Phụ kiện chính hãng.
            </p>
            <div className="flex gap-4">
              {[Facebook, Instagram, Youtube, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 bg-surface-100 rounded-xl flex items-center justify-center border border-surface-200 hover:border-primary-500/50 hover:bg-primary-900/20 transition-all group">
                  <Icon className="w-5 h-5 text-surface-500 group-hover:text-primary-400" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Links (Col: 2+2) */}
          <div className="lg:col-span-2 space-y-8">
            <h3 className="text-surface-900 font-black uppercase text-[10px] tracking-[0.2em]">Khám Phá</h3>
            <ul className="space-y-4">
              {['Về chúng tôi', 'Hệ thống cửa hàng', 'Tuyển dụng', 'Góc công nghệ'].map(link => (
                <li key={link}>
                  <Link to="#" className="text-xs font-bold uppercase tracking-widest hover:text-primary-400 transition-colors">{link}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <h3 className="text-surface-900 font-black uppercase text-[10px] tracking-[0.2em]">Hỗ Trợ</h3>
            <ul className="space-y-4">
              {['Chính sách bảo hành', 'Đổi trả 1-1', 'Giao hàng siêu tốc', 'Bảo mật thông tin'].map(link => (
                <li key={link}>
                  <Link to="#" className="text-xs font-bold uppercase tracking-widest hover:text-primary-400 transition-colors">{link}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Trust (Col: 4) */}
          <div className="lg:col-span-4 space-y-8">
            <h3 className="text-surface-900 font-black uppercase text-[10px] tracking-[0.2em]">Tổng đài hỗ trợ</h3>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-900/20 rounded-2xl flex items-center justify-center text-primary-400 border border-primary-500/20">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-surface-500 uppercase tracking-widest">Mua hàng trực tuyến</p>
                  <a href="tel:18001000" className="text-xl font-black text-surface-900 tracking-tighter hover:text-primary-400 transition-colors">1800.1000</a>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-accent-900/20 rounded-2xl flex items-center justify-center text-accent-400 border border-accent-500/20">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-surface-500 uppercase tracking-widest">Bảo hành / Khiếu nại</p>
                  <a href="tel:18001001" className="text-xl font-black text-surface-900 tracking-tighter hover:text-accent-400 transition-colors">1800.1001</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-10 border-t border-surface-200/50 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="flex flex-col md:flex-row items-center gap-6 text-[10px] font-black text-surface-500 uppercase tracking-widest">
            <p>&copy; {new Date().getFullYear()} LIECHTOP TECHNOLOGY CORP.</p>
            <div className="hidden md:block w-px h-3 bg-surface-200" />
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          </div>
          
          <div className="flex items-center gap-6 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
            <CreditCard className="w-5 h-5 text-white" />
            <Truck className="w-5 h-5 text-white" />
            <ShieldCheck className="w-5 h-5 text-white" />
            <div className="flex items-center gap-1">
              <Zap className="w-4 h-4 text-white" />
              <span className="text-[10px] font-black tracking-widest uppercase">Verified</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
