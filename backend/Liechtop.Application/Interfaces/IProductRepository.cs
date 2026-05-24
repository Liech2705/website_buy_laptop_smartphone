using Liechtop.Application.DTOs;
using Liechtop.Domain.Entities;

namespace Liechtop.Application.Interfaces
{
    public interface IProductRepository
    {
        IQueryable<Product> GetQueryable();

        Task<Product?> GetByIdAsync(Guid id);
        Task<Product> CreateAsync(Product product);
        Task UpdateAsync(Product product);
        Task DeleteAsync(Guid id);

        Task<Guid?> GetBrandIdByNameAsync(string brandName);
        Task ReplaceImagesAsync(Guid productId, IEnumerable<string> imageUrls);
        Task UpsertVariantsAsync(Guid productId, IEnumerable<VariantInputDto> variants);
        Task UpsertAttributesAsync(Guid productId, IEnumerable<AttributeInputDto> attributes);
        Task<List<string>> GetAttributeNamesAsync();
    }
}
