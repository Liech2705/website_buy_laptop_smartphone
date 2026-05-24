import { useState, useEffect } from 'react';
import { 
  Plus, MapPin, Phone, User, CheckCircle2, Trash2, Edit2, 
  Search, Info, AlertTriangle, ChevronRight, X 
} from 'lucide-react';
import { 
  getMyAddresses, createAddress, updateAddress, 
  deleteAddress, setDefaultAddress 
} from '../../../services/addressApi';
import { getProvinces, getDistricts, getWards } from '../../../services/vnProvinceApi';
import { toast } from 'react-hot-toast';

const AddressModal = ({ address, isOpen, onClose, onSave }) => {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    province: '',
    district: '',
    ward: '',
    detailAddress: '',
    isDefault: false
  });
  
  const [isOther, setIsOther] = useState({
    province: false,
    district: false,
    ward: false
  });

  useEffect(() => {
    if (isOpen) {
      loadProvinces();
      if (address) {
        setForm(address);
      } else {
        setForm({
          fullName: '',
          phone: '',
          province: '',
          district: '',
          ward: '',
          detailAddress: '',
          isDefault: false
        });
      }
    }
  }, [isOpen, address]);

  const loadProvinces = async () => {
    try {
      const data = await getProvinces();
      setProvinces(data);
    } catch (e) {
      toast.error('Không thể tải danh sách tỉnh thành');
    }
  };

  const handleProvinceChange = async (e) => {
    const val = e.target.value;
    if (val === 'OTHER') {
      setIsOther({ ...isOther, province: true, district: true, ward: true });
      setForm({ ...form, province: '', district: '', ward: '' });
      return;
    }
    
    setIsOther({ ...isOther, province: false });
    const province = provinces.find(p => p.name === val);
    setForm({ ...form, province: val, district: '', ward: '' });
    if (province) {
      const data = await getDistricts(province.code);
      setDistricts(data);
    }
  };

  const handleDistrictChange = async (e) => {
    const val = e.target.value;
    if (val === 'OTHER') {
      setIsOther({ ...isOther, district: true, ward: true });
      setForm({ ...form, district: '', ward: '' });
      return;
    }

    setIsOther({ ...isOther, district: false });
    const district = districts.find(d => d.name === val);
    setForm({ ...form, district: val, ward: '' });
    if (district) {
      const data = await getWards(district.code);
      setWards(data);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.province || !form.district || !form.ward) {
        toast.error('Vui lòng điền đầy đủ thông tin địa chỉ');
        return;
    }
    setLoading(true);
    try {
      await onSave(form);
      onClose();
    } catch (e) {
      toast.error('Lỗi khi lưu địa chỉ');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-surface-100 w-full max-w-2xl rounded-3xl border border-surface-200/50 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-surface-200/50 flex justify-between items-center bg-surface-100">
          <h2 className="text-xl font-black text-surface-900">
            {address ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-surface-200 rounded-xl transition-colors">
            <X className="w-5 h-5 text-surface-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-surface-400 ml-1">Họ tên người nhận</label>
              <input 
                required 
                value={form.fullName}
                onChange={e => setForm({...form, fullName: e.target.value})}
                placeholder="VD: Nguyễn Văn A"
                className="w-full px-4 py-3 rounded-2xl bg-surface-200/50 border border-surface-300 outline-none focus:ring-2 focus:ring-primary-500 font-medium" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-surface-400 ml-1">Số điện thoại</label>
              <input 
                required 
                value={form.phone}
                onChange={e => setForm({...form, phone: e.target.value})}
                placeholder="VD: 0912xxxxxx"
                className="w-full px-4 py-3 rounded-2xl bg-surface-200/50 border border-surface-300 outline-none focus:ring-2 focus:ring-primary-500 font-medium" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Province Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-surface-400 ml-1">Tỉnh/Thành phố</label>
              {!isOther.province ? (
                <select 
                  className="w-full px-4 py-3 rounded-2xl bg-surface-200/50 border border-surface-300 outline-none focus:ring-2 focus:ring-primary-500 font-medium cursor-pointer"
                  value={form.province}
                  onChange={handleProvinceChange}
                >
                  <option value="">Chọn Tỉnh/Thành</option>
                  {provinces.map(p => <option key={p.code} value={p.name}>{p.name}</option>)}
                  <option value="OTHER">-- Khác (Nhập tay) --</option>
                </select>
              ) : (
                <input 
                  placeholder="Nhập tỉnh thành"
                  className="w-full px-4 py-3 rounded-2xl bg-surface-200/50 border border-surface-300 outline-none focus:ring-2 focus:ring-primary-500 font-medium"
                  value={form.province}
                  onChange={e => setForm({...form, province: e.target.value})}
                />
              )}
            </div>

            {/* District Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-surface-400 ml-1">Quận/Huyện</label>
              {!isOther.district ? (
                <select 
                  className="w-full px-4 py-3 rounded-2xl bg-surface-200/50 border border-surface-300 outline-none focus:ring-2 focus:ring-primary-500 font-medium cursor-pointer"
                  value={form.district}
                  onChange={handleDistrictChange}
                  disabled={!form.province}
                >
                  <option value="">Chọn Quận/Huyện</option>
                  {districts.map(d => <option key={d.code} value={d.name}>{d.name}</option>)}
                  <option value="OTHER">-- Khác --</option>
                </select>
              ) : (
                <input 
                  placeholder="Nhập quận huyện"
                  className="w-full px-4 py-3 rounded-2xl bg-surface-200/50 border border-surface-300 outline-none focus:ring-2 focus:ring-primary-500 font-medium"
                  value={form.district}
                  onChange={e => setForm({...form, district: e.target.value})}
                />
              )}
            </div>

            {/* Ward Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-surface-400 ml-1">Phường/Xã</label>
              {!isOther.ward ? (
                <select 
                  className="w-full px-4 py-3 rounded-2xl bg-surface-200/50 border border-surface-300 outline-none focus:ring-2 focus:ring-primary-500 font-medium cursor-pointer"
                  value={form.ward}
                  onChange={e => {
                    if (e.target.value === 'OTHER') {
                        setIsOther({...isOther, ward: true});
                        setForm({...form, ward: ''});
                    } else {
                        setForm({...form, ward: e.target.value});
                    }
                  }}
                  disabled={!form.district}
                >
                  <option value="">Chọn Phường/Xã</option>
                  {wards.map(w => <option key={w.code} value={w.name}>{w.name}</option>)}
                  <option value="OTHER">-- Khác --</option>
                </select>
              ) : (
                <input 
                  placeholder="Nhập phường xã"
                  className="w-full px-4 py-3 rounded-2xl bg-surface-200/50 border border-surface-300 outline-none focus:ring-2 focus:ring-primary-500 font-medium"
                  value={form.ward}
                  onChange={e => setForm({...form, ward: e.target.value})}
                />
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-surface-400 ml-1">Địa chỉ cụ thể (Số nhà, tên đường...)</label>
            <textarea 
              required
              rows={3}
              value={form.detailAddress}
              onChange={e => setForm({...form, detailAddress: e.target.value})}
              placeholder="VD: 123 Đường Xuân Thủy"
              className="w-full px-4 py-3 rounded-2xl bg-surface-200/50 border border-surface-300 outline-none focus:ring-2 focus:ring-primary-500 font-medium resize-none"
            />
          </div>

          <div className="flex items-center gap-3 p-4 bg-primary-600/5 rounded-2xl border border-primary-500/10 hover:bg-primary-600/10 transition-colors group cursor-pointer" onClick={() => setForm({...form, isDefault: !form.isDefault})}>
            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${form.isDefault ? 'bg-primary-600 border-primary-600' : 'border-surface-400 group-hover:border-primary-500'}`}>
              {form.isDefault && <CheckCircle2 className="w-4 h-4 text-white" />}
            </div>
            <span className="font-bold text-surface-900">Đặt làm địa chỉ mặc định</span>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3.5 rounded-2xl border border-surface-300 text-surface-600 font-bold hover:bg-surface-200 transition-all">
              Hủy bỏ
            </button>
            <button 
                type="submit" 
                disabled={loading}
                className="flex-1 py-3.5 rounded-2xl bg-primary-600 text-white font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-900/20 active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Đang lưu...' : (address ? 'Cập nhật' : 'Thêm mới')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AddressBook = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, address: null });

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const res = await getMyAddresses();
      setAddresses(res);
    } catch (e) {
      toast.error('Không thể tải danh sách địa chỉ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleSave = async (data) => {
    if (modal.address) {
      await updateAddress(modal.address.id, data);
      toast.success('Đã cập nhật địa chỉ');
    } else {
      await createAddress(data);
      toast.success('Đã thêm địa chỉ mới');
    }
    fetchAddresses();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) {
      try {
        await deleteAddress(id);
        toast.success('Đã xóa địa chỉ');
        fetchAddresses();
      } catch (e) {
        toast.error('Lỗi khi xóa địa chỉ');
      }
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await setDefaultAddress(id);
      toast.success('Đã đặt làm mặc định');
      fetchAddresses();
    } catch (e) {
      toast.error('Lỗi khi thiết lập mặc định');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-surface-900">Sổ địa chỉ</h1>
          <p className="text-surface-500 text-sm">Nơi lưu trữ các điểm giao hàng của bạn</p>
        </div>
        <button 
          onClick={() => setModal({ open: true, address: null })}
          className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl transition-all shadow-lg active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Thêm địa chỉ mới
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1,2].map(i => <div key={i} className="h-48 bg-surface-100 rounded-3xl animate-pulse border border-surface-200/50" />)}
        </div>
      ) : addresses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((addr) => (
            <div 
              key={addr.id} 
              className={`bg-surface-100 p-6 rounded-3xl border transition-all hover:shadow-2xl hover:shadow-black/20 group relative overflow-hidden ${
                addr.isDefault ? 'border-primary-500/50 ring-1 ring-primary-500/50' : 'border-surface-200/50'
              }`}
            >
              {addr.isDefault && (
                <div className="absolute top-0 right-0 bg-primary-600 text-white text-[10px] font-black px-4 py-1.5 rounded-bl-2xl uppercase tracking-wider">
                  Mặc định
                </div>
              )}

              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-surface-200 rounded-xl">
                  <User className="w-5 h-5 text-surface-500" />
                </div>
                <div>
                  <h3 className="font-black text-surface-900">{addr.fullName}</h3>
                  <div className="flex items-center gap-2 mt-1 text-surface-500 text-sm font-medium">
                    <Phone className="w-4 h-4" />
                    <span>{addr.phone}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 text-surface-600 text-sm leading-relaxed min-h-12 mb-6">
                <MapPin className="w-5 h-5 text-surface-400 mt-1 flex-shrink-0" />
                <p>
                  {addr.detailAddress}, <br />
                  {addr.ward}, {addr.district}, {addr.province}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-surface-200/50 mt-auto">
                <div className="flex gap-1">
                  <button 
                    onClick={() => setModal({ open: true, address: addr })}
                    className="p-2 hover:bg-surface-200 rounded-xl text-surface-500 hover:text-primary-500 transition-all font-bold text-xs flex items-center gap-1.5"
                  >
                    <Edit2 className="w-4 h-4" /> Sửa
                  </button>
                  <button 
                    onClick={() => handleDelete(addr.id)}
                    className="p-2 hover:bg-red-500/10 rounded-xl text-surface-500 hover:text-red-500 transition-all font-bold text-xs flex items-center gap-1.5"
                  >
                    <Trash2 className="w-4 h-4" /> Xóa
                  </button>
                </div>
                
                {!addr.isDefault && (
                  <button 
                    onClick={() => handleSetDefault(addr.id)}
                    className="text-xs font-black text-primary-500 hover:bg-primary-600/10 px-4 py-2 rounded-xl transition-all"
                  >
                    ĐẶT MẶC ĐỊNH
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-surface-100 rounded-3xl p-16 text-center border-2 border-dashed border-surface-200/50">
          <div className="w-20 h-20 bg-surface-200 rounded-full flex items-center justify-center mx-auto mb-6 text-surface-400">
            <MapPin className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold text-surface-700">Chưa có địa chỉ nào</h2>
          <p className="text-surface-500 mt-2 mb-8">Hãy thêm địa chỉ giao hàng để thuận tiện cho việc đặt hàng.</p>
          <button 
            onClick={() => setModal({ open: true, address: null })}
            className="px-8 py-3 bg-primary-600 text-white font-bold rounded-2xl hover:bg-primary-700 transition-all"
          >
            Thêm ngay địa chỉ đầu tiên
          </button>
        </div>
      )}

      {/* Modal Tooltip-like Info */}
      <div className="flex items-start gap-3 p-4 bg-amber-950/20 border border-amber-500/20 rounded-2xl">
        <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-200/80 leading-relaxed font-medium">
          <strong>Lưu ý:</strong> Bạn nên để địa chỉ thường dùng nhất làm "Mặc định". Hệ thống sẽ ưu tiên chọn địa chỉ này khi bạn tiến hành thanh toán để tiết kiệm thời gian.
        </p>
      </div>

      <AddressModal 
        isOpen={modal.open} 
        address={modal.address} 
        onClose={() => setModal({ open: false, address: null })}
        onSave={handleSave}
      />
    </div>
  );
};

export default AddressBook;
