using Liechtop.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Liechtop.Application.Interfaces
{
    public interface IVoucherService
    {
        // ─── Admin CRUD ─────────────────────────────────────────────────
        Task<IEnumerable<VoucherDto>> GetAllAsync();
        Task<VoucherDto?> GetByIdAsync(Guid id);
        Task<VoucherDto> CreateAsync(CreateVoucherDto dto);
        Task<VoucherDto> UpdateAsync(Guid id, CreateVoucherDto dto);
        Task<bool> DeleteAsync(Guid id);

        // ─── User Wallet (Ví Voucher) ───────────────────────────────────
        /// <summary>Save a public voucher into the user's wallet. Returns the saved UserVoucher DTO.</summary>
        Task<UserVoucherDto> SaveVoucherAsync(Guid userId, string code);
        /// <summary>Get all vouchers in the user's wallet (with validity info).</summary>
        Task<IEnumerable<UserVoucherDto>> GetMyVouchersAsync(Guid userId);

        // ─── Checkout Validation ─────────────────────────────────────────
        /// <summary>Validate a voucher for checkout. Pass userId for per-user limit checking.</summary>
        Task<ApplyVoucherResultDto> ValidateVoucherAsync(string code, decimal orderAmount, Guid userId);
        /// <summary>Mark the UserVoucher entry as used after order is created.</summary>
        Task MarkVoucherUsedAsync(Guid userId, string voucherCode);
        /// <summary>Restore the UserVoucher entry when an order is cancelled.</summary>
        Task RestoreVoucherAsync(Guid userId, string voucherCode);
    }
}
