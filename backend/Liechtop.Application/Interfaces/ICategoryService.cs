using Liechtop.Application.DTOs;

namespace Liechtop.Application.Interfaces
{
    public interface ICategoryService
    {
        Task<List<CategoryDto>> GetAllAsync();
        Task<CategoryDto?> GetByIdAsync(Guid id);
        Task<CategoryDto> CreateAsync(CreateCategoryDto dto);
        Task<CategoryDto> UpdateAsync(Guid id, CreateCategoryDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}
