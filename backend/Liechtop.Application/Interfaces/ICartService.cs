using Liechtop.Application.DTOs;

namespace Liechtop.Application.Interfaces
{
    public interface ICartService
    {
        Task<CartDto> GetCartAsync(Guid userId);
        Task<CartDto> AddItemAsync(Guid userId, AddToCartDto dto);
        Task<CartDto> UpdateItemAsync(Guid userId, Guid variantId, UpdateCartItemDto dto);
        Task<CartDto> RemoveItemAsync(Guid userId, Guid variantId);
        Task ClearCartAsync(Guid userId);
    }
}
