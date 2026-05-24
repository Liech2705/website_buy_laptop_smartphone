using Liechtop.Application.Interfaces;
using Liechtop.Domain.Entities;
using Liechtop.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Liechtop.Infrastructure.Repositories
{
    public class VoucherRepository : IVoucherRepository
    {
        private readonly AppDbContext _context;

        public VoucherRepository(AppDbContext context)
        {
            _context = context;
        }

        // ─── Voucher CRUD ────────────────────────────────────────────────
        public async Task<IEnumerable<Voucher>> GetAllAsync()
            => await _context.Vouchers.OrderByDescending(x => x.CreatedAt).ToListAsync();

        public async Task<Voucher?> GetByIdAsync(Guid id)
            => await _context.Vouchers.FindAsync(id);

        public async Task<Voucher?> GetByCodeAsync(string code)
            => await _context.Vouchers.FirstOrDefaultAsync(x => x.Code.ToLower() == code.ToLower());

        public async Task AddAsync(Voucher voucher)
        {
            await _context.Vouchers.AddAsync(voucher);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Voucher voucher)
        {
            _context.Vouchers.Update(voucher);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Voucher voucher)
        {
            _context.Vouchers.Remove(voucher);
            await _context.SaveChangesAsync();
        }

        // ─── UserVoucher (Ví Voucher) ─────────────────────────────────────
        public async Task<IEnumerable<UserVoucher>> GetUserVouchersAsync(Guid userId)
            => await _context.UserVouchers
                .Include(uv => uv.Voucher)
                .Where(uv => uv.UserId == userId)
                .OrderByDescending(uv => uv.SavedAt)
                .ToListAsync();

        public async Task<UserVoucher?> GetUserVoucherAsync(Guid userId, Guid voucherId)
            => await _context.UserVouchers
                .FirstOrDefaultAsync(uv => uv.UserId == userId && uv.VoucherId == voucherId);

        public async Task AddUserVoucherAsync(UserVoucher userVoucher)
        {
            await _context.UserVouchers.AddAsync(userVoucher);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateUserVoucherAsync(UserVoucher userVoucher)
        {
            _context.UserVouchers.Update(userVoucher);
            await _context.SaveChangesAsync();
        }

        // ─── Per-user usage counting ──────────────────────────────────────
        public async Task<int> CountUserOrdersWithVoucherAsync(Guid userId, string voucherCode)
            => await _context.Orders
                .CountAsync(o => o.UserId == userId
                              && o.AppliedVoucherCode == voucherCode
                              && o.Status != "Cancelled");
    }
}
