using Liechtop.Domain.Entities;

namespace Liechtop.Application.Interfaces
{
    public interface IPaymentRepository
    {
        Task AddPaymentAsync(Payment payment);
    }
}
