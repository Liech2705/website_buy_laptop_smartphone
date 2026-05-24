import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getUserById, assignRole } from '../../../services/adminApi';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Loader2, ShieldCheck, ShieldAlert, ShieldOff, User, Mail, Phone, Calendar } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

export default function AdminUserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [selectedRole, setSelectedRole] = useState('Customer');

  const fetchUser = async () => {
    setLoading(true);
    try { setUser(await getUserById(id)); }
    catch { toast.error('Lỗi tải thông tin người dùng'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUser(); }, [id]);

  useEffect(() => {
    if (user) {
      setSelectedRole(user.roleName || 'Customer');
    }
  }, [user]);

  const handleAssignRole = async () => {
    if (selectedRole === user.roleName) {
      toast.error('Vai trò chưa được thay đổi');
      return;
    }
    const confirmMessage = `Bạn có chắc chắn muốn chuyển vai trò của ${user.fullName || user.email} từ "${user.roleName || 'Khách hàng'}" thành "${selectedRole}"?`;
    if (!window.confirm(confirmMessage)) return;

    setAssigning(true);
    try {
      await assignRole(id, selectedRole);
      toast.success(`Đã cập nhật vai trò thành ${selectedRole}`);
      fetchUser();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi cập nhật vai trò');
    } finally {
      setAssigning(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-7 h-7 text-primary-500 animate-spin" />
    </div>
  );

  if (!user) return <div className="text-center py-20 text-surface-500">Không tìm thấy người dùng</div>;

  const roleNameLower = user.roleName?.toLowerCase() || 'customer';
  const isOwner = roleNameLower === 'owner';
  const isAdmin = roleNameLower === 'admin';

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/admin/users')} className="p-2 hover:bg-surface-200 rounded-xl text-surface-400">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-black text-white">Chi tiết người dùng</h1>
      </div>

      {/* Profile Card */}
      <div className="bg-surface-100 rounded-3xl border border-surface-200/30 overflow-hidden">
        <div className="bg-gradient-to-br from-primary-600/20 to-surface-100 p-8 flex items-center gap-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center font-black text-white text-3xl flex-shrink-0 shadow-xl shadow-primary-900/30">
            {(user.fullName || user.email || 'U')[0].toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-black text-white">{user.fullName || 'Người dùng'}</h2>
            <p className="text-surface-400 text-sm font-medium">{user.email}</p>
            <span className={`mt-2 inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
              isOwner 
                ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' 
                : isAdmin 
                  ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' 
                  : 'bg-surface-200/50 text-surface-400 border border-surface-200/10'
            }`}>
              {isOwner ? '👑 Owner' : isAdmin ? '⚡ Admin' : '👤 Khách hàng'}
            </span>
          </div>
        </div>

        <div className="p-6 space-y-4 border-t border-surface-200/20">
          <h3 className="text-xs font-black text-surface-500 uppercase tracking-widest">Thông tin</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: User,     label: 'Họ tên',       value: user.fullName },
              { icon: Mail,     label: 'Email',         value: user.email },
              { icon: Phone,    label: 'Điện thoại',    value: user.phone },
              { icon: Calendar, label: 'Ngày đăng ký',  value: user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '—' },
              { icon: User,     label: 'Giới tính',     value: user.gender },
              { icon: Calendar, label: 'Ngày sinh',     value: user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('vi-VN') : '—' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3">
                <Icon className="w-4 h-4 text-surface-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-surface-600 font-bold uppercase">{label}</p>
                  <p className="text-sm font-semibold text-surface-700">{value || '—'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Role Management */}
        <div className="p-6 border-t border-surface-200/20 space-y-4">
          <h3 className="text-xs font-black text-surface-500 uppercase tracking-widest">Quản lý vai trò (Phân quyền)</h3>
          
          {(() => {
            const isSelf = currentUser?.id === user?.id;
            const isCurrentUserOwner = currentUser?.role?.toLowerCase() === 'owner';
            
            const rolesList = [
              {
                name: 'Customer',
                label: 'Khách hàng',
                desc: 'Chỉ được mua sắm, viết đánh giá và quản lý ví voucher, địa chỉ cá nhân.',
                icon: User,
                color: 'border-surface-200/30 hover:border-surface-200 text-surface-400 bg-surface-200/5',
                activeColor: 'border-surface-400 bg-surface-200/20 text-white'
              },
              {
                name: 'Admin',
                label: 'Admin',
                desc: 'Quản lý sản phẩm, danh mục, đơn hàng, voucher, và xem danh sách người dùng.',
                icon: ShieldCheck,
                color: 'border-primary-500/10 hover:border-primary-500/30 text-primary-400/70 bg-primary-500/5',
                activeColor: 'border-primary-500 bg-primary-500/20 text-primary-300'
              },
              {
                name: 'Owner',
                label: 'Owner',
                desc: 'Quyền tối cao. Quản lý mọi cấu hình hệ thống bao gồm phân quyền Admin/Owner.',
                icon: ShieldAlert,
                color: 'border-pink-500/10 hover:border-pink-500/30 text-pink-400/70 bg-pink-500/5',
                activeColor: 'border-pink-500 bg-pink-500/20 text-pink-300'
              }
            ];

            if (!isCurrentUserOwner || isSelf) {
              return (
                <div className="bg-surface-200/10 rounded-2xl p-4 border border-surface-200/10">
                  <p className="text-xs text-surface-400 font-bold italic flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-500" />
                    {isSelf 
                      ? 'Bạn không thể tự thay đổi vai trò của chính mình.'
                      : 'Bạn không có quyền phân chia vai trò thành viên. Chỉ có tài khoản Owner mới thực hiện được.'}
                  </p>
                </div>
              );
            }

            return (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 gap-3">
                  {rolesList.map((r) => {
                    const Icon = r.icon;
                    const isSelected = selectedRole?.toLowerCase() === r.name.toLowerCase();
                    return (
                      <button
                        key={r.name}
                        onClick={() => setSelectedRole(r.name)}
                        className={`flex items-start gap-4 p-4 rounded-2xl border text-left transition-all duration-300 ${
                          isSelected ? r.activeColor + ' ring-2 ring-current/20 shadow-lg' : r.color
                        }`}
                      >
                        <div className="p-2.5 rounded-xl bg-surface-100 border border-surface-200/30 flex-shrink-0">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold uppercase text-xs tracking-wider">{r.label}</span>
                            {user.roleName?.toLowerCase() === r.name.toLowerCase() && (
                              <span className="text-[9px] bg-white/10 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest text-surface-400">Hiện tại</span>
                            )}
                          </div>
                          <p className="text-[11px] text-surface-400 font-semibold mt-1 leading-relaxed">{r.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between gap-4 pt-2">
                  <button
                    onClick={handleAssignRole}
                    disabled={assigning || selectedRole?.toLowerCase() === user.roleName?.toLowerCase()}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-primary-950/40 active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
                  >
                    {assigning ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <ShieldCheck className="w-4 h-4" />
                    )}
                    Lưu thay đổi vai trò
                  </button>
                  
                  {selectedRole?.toLowerCase() !== user.roleName?.toLowerCase() && (
                    <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider animate-pulse">
                      ⚠️ Có thay đổi chưa lưu
                    </p>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
