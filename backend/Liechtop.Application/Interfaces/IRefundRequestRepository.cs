using System;
using System.Threading.Tasks;
using Liechtop.Domain.Entities;

namespace Liechtop.Application.Interfaces
{
    public interface IRefundRequestRepository
    {
        Task AddRefundRequestAsync(RefundRequest request);
        Task<RefundRequest?> GetRefundRequestByOrderIdAsync(Guid orderId);
        Task<RefundRequest?> GetRefundRequestByIdAsync(Guid id);
        Task UpdateRefundRequestAsync(RefundRequest request);
    }
}
