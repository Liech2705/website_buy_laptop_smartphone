using Liechtop.Application.DTOs;

namespace Liechtop.Application.Interfaces
{
    public interface IProductService
    {
        Task<PagedResult<ProductDto>> GetPagedAsync(ProductQuery query);
        Task<ProductDto?> GetByIdAsync(Guid id);
        Task<ProductDto> CreateAsync(CreateProductDto dto);
        Task<ProductDto> UpdateAsync(Guid id, UpdateProductDto dto);
        Task<bool> DeleteAsync(Guid id);
        Task<List<string>> GetAvailableAttributeNamesAsync();
    }
}
