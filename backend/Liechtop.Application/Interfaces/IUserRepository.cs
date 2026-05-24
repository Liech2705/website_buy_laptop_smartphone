using Liechtop.Domain.Entities;

namespace Liechtop.Application.Interfaces
{
    public interface IUserRepository
    {
        Task<User?> GetByEmailAsync(string email);
        Task<bool> EmailExistsAsync(string email);
        Task AddAsync(User user);
        
        IQueryable<User> GetQueryable();
        Task<User?> GetByIdAsync(Guid id);
        Task UpdateUserAsync(User user);

        // Transaction support
        Task BeginTransactionAsync();
        Task CommitTransactionAsync();
        Task RollbackTransactionAsync();
    }
}
