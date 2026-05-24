import { Link, useLocation, Outlet } from 'react-router-dom';
import { User, MapPin, Package, Shield, LogOut, ChevronRight, Ticket } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

const ProfileLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    { id: 'profile', label: 'Thông tin cá nhân', icon: User, path: '/profile' },
    { id: 'addresses', label: 'Sổ địa chỉ', icon: MapPin, path: '/profile/addresses' },
    { id: 'orders', label: 'Đơn hàng của tôi', icon: Package, path: '/profile/orders' },
    { id: 'vouchers', label: 'Ví Voucher', icon: Ticket, path: '/profile/vouchers' },
    { id: 'security', label: 'Đổi mật khẩu', icon: Shield, path: '/profile/change-password' },
  ];

  return (
    <div className="min-h-screen bg-surface-50 pt-32 pb-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar */}
          <aside className="lg:w-80 flex-shrink-0">
            <div className="bg-surface-100 rounded-3xl p-6 border border-surface-200/50 shadow-xl shadow-black/20 sticky top-32">
              {/* User Brief */}
              <div className="flex items-center gap-4 mb-8 pb-8 border-b border-surface-200/50">
                <div className="w-16 h-16 rounded-2xl bg-primary-600 flex items-center justify-center text-white text-2xl font-black">
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
                <div>
                  <h2 className="text-surface-900 font-bold text-lg leading-tight">{user?.fullName}</h2>
                  <p className="text-surface-500 text-sm">{user?.email}</p>
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      className={`flex items-center justify-between p-4 rounded-2xl transition-all group ${
                        isActive 
                          ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/30' 
                          : 'text-surface-600 hover:bg-surface-200 hover:text-surface-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-surface-400 group-hover:text-primary-500'}`} />
                        <span className="font-bold">{item.label}</span>
                      </div>
                      <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
                    </Link>
                  );
                })}

                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 p-4 rounded-2xl text-red-400 hover:bg-red-500/10 transition-all font-bold mt-4"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Đăng xuất</span>
                </button>
              </nav>
            </div>
          </aside>

          {/* Content Area */}
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>

        </div>
      </div>
    </div>
  );
};

export default ProfileLayout;
