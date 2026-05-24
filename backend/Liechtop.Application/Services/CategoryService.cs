using Liechtop.Application.DTOs;
using Liechtop.Application.Interfaces;
using Liechtop.Domain.Entities;

namespace Liechtop.Application.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly ICategoryRepository _categoryRepository;

        public CategoryService(ICategoryRepository categoryRepository)
        {
            _categoryRepository = categoryRepository;
        }

        public async Task<List<CategoryDto>> GetAllAsync()
        {
            var categories = await _categoryRepository.GetAllAsync();
            return categories.Select(c => new CategoryDto
            {
                Id       = c.Id,
                Name     = c.Name,
                ParentId = c.ParentId,
                ParentName = c.Parent?.Name
            }).ToList();
        }

        public async Task<CategoryDto?> GetByIdAsync(Guid id)
        {
            var c = await _categoryRepository.GetByIdAsync(id);
            if (c == null) return null;
            var count = await _categoryRepository.GetProductCountAsync(id);
            return new CategoryDto
            {
                Id           = c.Id,
                Name         = c.Name,
                ParentId     = c.ParentId,
                ParentName   = c.Parent?.Name,
                ProductCount = count
            };
        }

        public async Task<CategoryDto> CreateAsync(CreateCategoryDto dto)
        {
            var category = new Category
            {
                Id       = Guid.NewGuid(),
                Name     = dto.Name.Trim(),
                ParentId = dto.ParentId
            };
            await _categoryRepository.AddAsync(category);
            return await GetByIdAsync(category.Id) ?? throw new Exception("Failed to create category.");
        }

        public async Task<CategoryDto> UpdateAsync(Guid id, CreateCategoryDto dto)
        {
            var c = await _categoryRepository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException("Danh mục không tồn tại.");

            if (dto.ParentId == id)
                throw new InvalidOperationException("Danh mục không thể là cha của chính nó.");

            c.Name     = dto.Name.Trim();
            c.ParentId = dto.ParentId;
            await _categoryRepository.UpdateAsync(c);
            return await GetByIdAsync(id) ?? throw new Exception("Failed to update category.");
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            return await _categoryRepository.DeleteAsync(id);
        }
    }
}
