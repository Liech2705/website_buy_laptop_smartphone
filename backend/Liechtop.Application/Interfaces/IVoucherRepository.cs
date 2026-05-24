using Liechtop.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Liechtop.Application.Interfaces
{
    public interface IVoucherRepository
    {
        // Voucher CRUD
        Task<IEnumerable<Voucher>> GetAllAsync();
        Task<Voucher?> GetByIdAsync(Guid id);
        Task<Voucher?> GetByCodeAsync(string code);
        Task AddAsync(Voucher voucher);
        Task UpdateAsync(Voucher voucher);
        Task DeleteAsync(Voucher voucher);

        // UserVoucher (Ví Voucher)
        Task<IEnumerable<UserVoucher>> GetUserVouchersAsync(Guid userId);
        Task<UserVoucher?> GetUserVoucherAsync(Guid userId, Guid voucherId);
        Task AddUserVoucherAsync(UserVoucher userVoucher);
        Task UpdateUserVoucherAsync(UserVoucher userVoucher);

        // Per-user usage counting (by checking order history)
        Task<int> CountUserOrdersWithVoucherAsync(Guid userId, string voucherCode);
    }
}
