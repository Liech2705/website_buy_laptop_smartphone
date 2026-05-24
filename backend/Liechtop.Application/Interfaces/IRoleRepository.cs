using Liechtop.Domain.Entities;

namespace Liechtop.Application.Interfaces
{
    public interface IRoleRepository
    {
        Task<Role?> GetByNameAsync(string name);
    }
}
