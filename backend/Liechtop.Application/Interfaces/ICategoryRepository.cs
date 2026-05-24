using Liechtop.Application.DTOs;
using Liechtop.Domain.Entities;

namespace Liechtop.Application.Interfaces
{
    public interface ICategoryRepository
    {
        Task<List<Category>> GetAllAsync();
        Task<Category?> GetByIdAsync(Guid id);
        Task<Category> AddAsync(Category category);
        Task UpdateAsync(Category category);
        Task<bool> DeleteAsync(Guid id);
        Task<int> GetProductCountAsync(Guid categoryId);
    }
}
