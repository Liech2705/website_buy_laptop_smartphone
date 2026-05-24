using System;
using System.Threading.Tasks;
using Liechtop.Application.Interfaces;
using Liechtop.Domain.Entities;
using Liechtop.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Liechtop.Infrastructure.Repositories
{
    public class RefundRequestRepository : IRefundRequestRepository
    {
        private readonly AppDbContext _context;

        public RefundRequestRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task AddRefundRequestAsync(RefundRequest request)
        {
            await _context.RefundRequests.AddAsync(request);
            await _context.SaveChangesAsync();
        }

        public async Task<RefundRequest?> GetRefundRequestByOrderIdAsync(Guid orderId)
        {
            return await _context.RefundRequests
                .FirstOrDefaultAsync(r => r.OrderId == orderId);
        }

        public async Task<RefundRequest?> GetRefundRequestByIdAsync(Guid id)
        {
            return await _context.RefundRequests.FindAsync(id);
        }

        public async Task UpdateRefundRequestAsync(RefundRequest request)
        {
            _context.RefundRequests.Update(request);
            await _context.SaveChangesAsync();
        }
    }
}
