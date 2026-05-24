using Liechtop.Application.DTOs;
using Liechtop.Application.Interfaces;
using Liechtop.Domain.Entities;

namespace Liechtop.Application.Services
{
    public class VoucherService : IVoucherService
    {
        private readonly IVoucherRepository _voucherRepo;

        public VoucherService(IVoucherRepository voucherRepo)
        {
            _voucherRepo = voucherRepo;
        }

        // ─── Admin CRUD ──────────────────────────────────────────────────

        public async Task<IEnumerable<VoucherDto>> GetAllAsync()
        {
            var vouchers = await _voucherRepo.GetAllAsync();
            return vouchers.Select(MapToDto);
        }

        public async Task<VoucherDto?> GetByIdAsync(Guid id)
        {
            var voucher = await _voucherRepo.GetByIdAsync(id);
            return voucher != null ? MapToDto(voucher) : null;
        }

        public async Task<VoucherDto> CreateAsync(CreateVoucherDto dto)
        {
            if (dto.DiscountAmount == null && dto.DiscountPercentage == null)
                throw new InvalidOperationException("Phải nhập số tiền giảm hoặc phần trăm giảm.");

            if (dto.ExpiryDate <= dto.StartDate)
                throw new InvalidOperationException("Ngày kết thúc phải sau ngày bắt đầu.");

            var existing = await _voucherRepo.GetByCodeAsync(dto.Code.ToUpper());
            if (existing != null) throw new InvalidOperationException("Mã voucher đã tồn tại.");

            var voucher = new Voucher
            {
                Id = Guid.NewGuid(),
                Code = dto.Code.ToUpper().Trim(),
                Description = dto.Description,
                DiscountAmount = dto.DiscountAmount,
                DiscountPercentage = dto.DiscountPercentage,
                MaxDiscountAmount = dto.MaxDiscountAmount,
                MinOrderAmount = dto.MinOrderAmount,
                StartDate = dto.StartDate.HasValue ? DateTime.SpecifyKind(dto.StartDate.Value, DateTimeKind.Utc) : null,
                ExpiryDate = dto.ExpiryDate.HasValue ? DateTime.SpecifyKind(dto.ExpiryDate.Value, DateTimeKind.Utc) : null,
                UsageLimit = dto.UsageLimit,
                UsageLimitPerUser = dto.UsageLimitPerUser,
                IsActive = dto.IsActive,
                CreatedAt = DateTime.UtcNow
            };

            await _voucherRepo.AddAsync(voucher);
            return MapToDto(voucher);
        }

        public async Task<VoucherDto> UpdateAsync(Guid id, CreateVoucherDto dto)
        {
            var voucher = await _voucherRepo.GetByIdAsync(id);
            if (voucher == null) throw new KeyNotFoundException("Không tìm thấy voucher.");

            if (dto.ExpiryDate <= dto.StartDate)
                throw new InvalidOperationException("Ngày kết thúc phải sau ngày bắt đầu.");

            voucher.Description = dto.Description;
            voucher.DiscountAmount = dto.DiscountAmount;
            voucher.DiscountPercentage = dto.DiscountPercentage;
            voucher.MaxDiscountAmount = dto.MaxDiscountAmount;
            voucher.MinOrderAmount = dto.MinOrderAmount;
            voucher.StartDate = dto.StartDate.HasValue ? DateTime.SpecifyKind(dto.StartDate.Value, DateTimeKind.Utc) : null;
            voucher.ExpiryDate = dto.ExpiryDate.HasValue ? DateTime.SpecifyKind(dto.ExpiryDate.Value, DateTimeKind.Utc) : null;
            voucher.UsageLimit = dto.UsageLimit;
            voucher.UsageLimitPerUser = dto.UsageLimitPerUser;
            voucher.IsActive = dto.IsActive;

            await _voucherRepo.UpdateAsync(voucher);
            return MapToDto(voucher);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var voucher = await _voucherRepo.GetByIdAsync(id);
            if (voucher == null) return false;
            await _voucherRepo.DeleteAsync(voucher);
            return true;
        }

        // ─── User Wallet (Ví Voucher) ────────────────────────────────────

        public async Task<UserVoucherDto> SaveVoucherAsync(Guid userId, string code)
        {
            var voucher = await _voucherRepo.GetByCodeAsync(code.ToUpper().Trim());
            if (voucher == null) throw new InvalidOperationException("Mã giảm giá không tồn tại.");
            if (!voucher.IsActive) throw new InvalidOperationException("Mã giảm giá không còn hiệu lực.");

            var now = DateTime.UtcNow;
            if (voucher.ExpiryDate.HasValue && voucher.ExpiryDate < now)
                throw new InvalidOperationException("Mã giảm giá đã hết hạn.");

            // Check if already saved
            var existing = await _voucherRepo.GetUserVoucherAsync(userId, voucher.Id);
            if (existing != null) throw new InvalidOperationException("Bạn đã lưu mã giảm giá này rồi.");

            // Check total usage limit
            if (voucher.UsageLimit.HasValue && voucher.UsedCount >= voucher.UsageLimit)
                throw new InvalidOperationException("Mã giảm giá đã hết lượt sử dụng.");

            var userVoucher = new UserVoucher
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                VoucherId = voucher.Id,
                IsUsed = false,
                SavedAt = DateTime.UtcNow
            };

            await _voucherRepo.AddUserVoucherAsync(userVoucher);
            return MapToUserVoucherDto(userVoucher, voucher);
        }

        public async Task<IEnumerable<UserVoucherDto>> GetMyVouchersAsync(Guid userId)
        {
            var userVouchers = await _voucherRepo.GetUserVouchersAsync(userId);
            return userVouchers.Select(uv => MapToUserVoucherDto(uv, uv.Voucher!));
        }

        // ─── Checkout Validation ─────────────────────────────────────────

        public async Task<ApplyVoucherResultDto> ValidateVoucherAsync(string code, decimal orderAmount, Guid userId)
        {
            var voucher = await _voucherRepo.GetByCodeAsync(code.ToUpper().Trim());
            if (voucher == null) throw new InvalidOperationException("Mã giảm giá không tồn tại.");
            if (!voucher.IsActive) throw new InvalidOperationException("Mã giảm giá đã bị vô hiệu hóa.");

            var now = DateTime.UtcNow;
            if (voucher.StartDate.HasValue && voucher.StartDate > now)
                throw new InvalidOperationException("Mã giảm giá chưa đến ngày sử dụng.");
            if (voucher.ExpiryDate.HasValue && voucher.ExpiryDate < now)
                throw new InvalidOperationException("Mã giảm giá đã hết hạn.");

            if (voucher.UsageLimit.HasValue && voucher.UsedCount >= voucher.UsageLimit)
                throw new InvalidOperationException("Mã giảm giá đã hết lượt sử dụng.");

            if (orderAmount < voucher.MinOrderAmount)
                throw new InvalidOperationException($"Đơn hàng tối thiểu {voucher.MinOrderAmount:N0}₫ để sử dụng mã này.");

            // Check per-user usage limit
            if (voucher.UsageLimitPerUser.HasValue)
            {
                var userUsageCount = await _voucherRepo.CountUserOrdersWithVoucherAsync(userId, voucher.Code);
                if (userUsageCount >= voucher.UsageLimitPerUser)
                    throw new InvalidOperationException($"Bạn đã sử dụng mã này {voucher.UsageLimitPerUser} lần (tối đa cho phép).");
            }

            // Calculate discount
            decimal discount = 0;
            if (voucher.DiscountAmount.HasValue)
            {
                discount = Math.Min(voucher.DiscountAmount.Value, orderAmount);
            }
            else if (voucher.DiscountPercentage.HasValue)
            {
                discount = orderAmount * (voucher.DiscountPercentage.Value / 100m);
                if (voucher.MaxDiscountAmount.HasValue)
                    discount = Math.Min(discount, voucher.MaxDiscountAmount.Value);
            }

            var discountDesc = voucher.DiscountPercentage.HasValue
                ? $"Giảm {voucher.DiscountPercentage}%{(voucher.MaxDiscountAmount.HasValue ? $" (tối đa {voucher.MaxDiscountAmount:N0}₫)" : "")}"
                : $"Giảm {voucher.DiscountAmount:N0}₫";

            return new ApplyVoucherResultDto
            {
                Code = voucher.Code,
                Description = voucher.Description ?? discountDesc,
                DiscountAmount = discount,
                Message = $"Áp dụng thành công! {discountDesc}",
                DiscountPercentage = voucher.DiscountPercentage,
                MaxDiscountAmount = voucher.MaxDiscountAmount
            };
        }

        public async Task MarkVoucherUsedAsync(Guid userId, string voucherCode)
        {
            var voucher = await _voucherRepo.GetByCodeAsync(voucherCode);
            if (voucher == null) return;

            var userVoucher = await _voucherRepo.GetUserVoucherAsync(userId, voucher.Id);
            if (userVoucher == null) return;

            userVoucher.IsUsed = true;
            userVoucher.UsedAt = DateTime.UtcNow;
            await _voucherRepo.UpdateUserVoucherAsync(userVoucher);
        }

        public async Task RestoreVoucherAsync(Guid userId, string voucherCode)
        {
            var voucher = await _voucherRepo.GetByCodeAsync(voucherCode);
            if (voucher == null) return;

            var userVoucher = await _voucherRepo.GetUserVoucherAsync(userId, voucher.Id);
            if (userVoucher == null) return;

            userVoucher.IsUsed = false;
            userVoucher.UsedAt = null;
            await _voucherRepo.UpdateUserVoucherAsync(userVoucher);

            // Also decrement global used count
            if (voucher.UsedCount > 0)
            {
                voucher.UsedCount--;
                await _voucherRepo.UpdateAsync(voucher);
            }
        }

        // ─── Private Helpers ─────────────────────────────────────────────

        private static VoucherDto MapToDto(Voucher v) => new VoucherDto
        {
            Id = v.Id,
            Code = v.Code,
            Description = v.Description,
            DiscountAmount = v.DiscountAmount,
            DiscountPercentage = v.DiscountPercentage,
            MaxDiscountAmount = v.MaxDiscountAmount,
            MinOrderAmount = v.MinOrderAmount,
            StartDate = v.StartDate,
            ExpiryDate = v.ExpiryDate,
            UsageLimit = v.UsageLimit,
            UsageLimitPerUser = v.UsageLimitPerUser,
            UsedCount = v.UsedCount,
            IsActive = v.IsActive,
            CreatedAt = v.CreatedAt
        };

        private static UserVoucherDto MapToUserVoucherDto(UserVoucher uv, Voucher v) => new UserVoucherDto
        {
            Id = uv.Id,
            VoucherId = v.Id,
            IsUsed = uv.IsUsed,
            UsedAt = uv.UsedAt,
            SavedAt = uv.SavedAt,
            Code = v.Code,
            Description = v.Description,
            DiscountAmount = v.DiscountAmount,
            DiscountPercentage = v.DiscountPercentage,
            MaxDiscountAmount = v.MaxDiscountAmount,
            MinOrderAmount = v.MinOrderAmount,
            StartDate = v.StartDate,
            ExpiryDate = v.ExpiryDate,
            VoucherIsActive = v.IsActive
        };
    }
}
