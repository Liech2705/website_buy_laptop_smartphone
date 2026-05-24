using Liechtop.Application.Interfaces;
using Liechtop.Domain.Entities;
using Liechtop.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Liechtop.Infrastructure.Repositories
{
    public class OtpRepository : IOtpRepository
    {
        private readonly AppDbContext _context;

        public OtpRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(OtpLog otp)
        {
            await _context.OtpLogs.AddAsync(otp);
            await _context.SaveChangesAsync();
        }

        public async Task<OtpLog?> GetLatestValidOtpAsync(string email, string type)
        {
            return await _context.OtpLogs
                .Where(x => x.Email == email && x.Type == type && !x.IsUsed && x.ExpiresAt > DateTime.UtcNow)
                .OrderByDescending(x => x.CreatedAt)
                .FirstOrDefaultAsync();
        }

        public async Task UpdateAsync(OtpLog otp)
        {
            _context.OtpLogs.Update(otp);
            await _context.SaveChangesAsync();
        }
    }
}
