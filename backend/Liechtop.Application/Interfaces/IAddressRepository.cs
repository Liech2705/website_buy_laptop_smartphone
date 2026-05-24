using Liechtop.Domain.Entities;

namespace Liechtop.Application.Interfaces
{
    public interface IAddressRepository
    {
        Task<List<Address>> GetByUserIdAsync(Guid userId);
        Task<Address?> GetByIdAsync(Guid id);
        Task AddAsync(Address address);
        Task UpdateAsync(Address address);
        Task DeleteAsync(Address address);
        Task<List<Address>> GetDefaultsByUserIdAsync(Guid userId);
    }
}
