using Liechtop.Domain.Entities;

namespace Liechtop.Application.Interfaces
{
    public interface ICartRepository
    {
        Task<Cart?> GetCartByUserIdAsync(Guid userId);
        Task<Cart> CreateCartAsync(Guid userId);
        Task UpdateCartAsync(Cart cart);
        Task<ProductVariant?> GetVariantByIdAsync(Guid variantId);
    }
}
