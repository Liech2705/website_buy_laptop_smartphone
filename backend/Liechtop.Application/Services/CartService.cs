using Liechtop.Application.DTOs;
using Liechtop.Application.Interfaces;
using Liechtop.Domain.Entities;

namespace Liechtop.Application.Services
{
    public class CartService : ICartService
    {
        private readonly ICartRepository _cartRepo;

        public CartService(ICartRepository cartRepo)
        {
            _cartRepo = cartRepo;
        }

        public async Task<CartDto> GetCartAsync(Guid userId)
        {
            var cart = await _cartRepo.GetCartByUserIdAsync(userId);
            if (cart == null)
            {
                cart = await _cartRepo.CreateCartAsync(userId);
            }
            return MapToDto(cart);
        }

        public async Task<CartDto> AddItemAsync(Guid userId, AddToCartDto dto)
        {
            var cart = await _cartRepo.GetCartByUserIdAsync(userId);
            if (cart == null)
            {
                cart = await _cartRepo.CreateCartAsync(userId);
            }

            var variant = await _cartRepo.GetVariantByIdAsync(dto.ProductVariantId);
            if (variant == null) throw new InvalidOperationException("Product variant not found.");

            var existingItem = cart.Items.FirstOrDefault(i => i.ProductVariantId == dto.ProductVariantId);
            int currentQuantity = existingItem?.Quantity ?? 0;
            int newQuantity = currentQuantity + dto.Quantity;

            // Cách B: Capping quantity at max stock without throwing exception (if not fully out of stock)
            int stock = variant.Stock ?? 0;
            if (stock <= 0) throw new InvalidOperationException("Sản phẩm đã hết hàng.");
            
            if (newQuantity > stock)
            {
                newQuantity = stock; // Tự động hạ về max stock
            }

            if (existingItem != null)
            {
                existingItem.Quantity = newQuantity;
            }
            else
            {
                cart.Items.Add(new CartItem
                {
                    Id = Guid.NewGuid(),
                    CartId = cart.Id,
                    ProductVariantId = dto.ProductVariantId,
                    Quantity = newQuantity
                });
            }

            await _cartRepo.UpdateCartAsync(cart);
            return MapToDto(cart);
        }

        public async Task<CartDto> UpdateItemAsync(Guid userId, Guid variantId, UpdateCartItemDto dto)
        {
            var cart = await _cartRepo.GetCartByUserIdAsync(userId);
            if (cart == null) throw new InvalidOperationException("Cart not found.");

            if (dto.Quantity <= 0)
            {
                return await RemoveItemAsync(userId, variantId);
            }

            var existingItem = cart.Items.FirstOrDefault(i => i.ProductVariantId == variantId);
            if (existingItem == null) throw new InvalidOperationException("Item not found in cart.");

            var variant = await _cartRepo.GetVariantByIdAsync(variantId);
            if (variant == null) throw new InvalidOperationException("Product variant not found.");

            int stock = variant.Stock ?? 0;
            int newQuantity = dto.Quantity;

            if (newQuantity > stock)
            {
                newQuantity = stock; // Tự động hạ về max stock
            }

            existingItem.Quantity = newQuantity;
            await _cartRepo.UpdateCartAsync(cart);
            
            return MapToDto(cart);
        }

        public async Task<CartDto> RemoveItemAsync(Guid userId, Guid variantId)
        {
            var cart = await _cartRepo.GetCartByUserIdAsync(userId);
            if (cart == null) return new CartDto();

            var item = cart.Items.FirstOrDefault(i => i.ProductVariantId == variantId);
            if (item != null)
            {
                cart.Items.Remove(item);
                await _cartRepo.UpdateCartAsync(cart);
            }

            return MapToDto(cart);
        }

        public async Task ClearCartAsync(Guid userId)
        {
            var cart = await _cartRepo.GetCartByUserIdAsync(userId);
            if (cart != null)
            {
                cart.Items.Clear();
                await _cartRepo.UpdateCartAsync(cart);
            }
        }

        private CartDto MapToDto(Cart cart)
        {
            return new CartDto
            {
                Id = cart.Id,
                UserId = cart.UserId ?? Guid.Empty,
                Items = cart.Items.Select(i => new CartItemDto
                {
                    Id = i.Id,
                    ProductVariantId = i.ProductVariantId ?? Guid.Empty,
                    ProductName = i.ProductVariant?.Product?.Name ?? "Unknown",
                    Sku = i.ProductVariant?.Sku ?? "",
                    ImageUrl = i.ProductVariant?.Product?.Images?.FirstOrDefault()?.ImageUrl ?? "",
                    Price = i.ProductVariant?.Price ?? 0,
                    Quantity = i.Quantity ?? 0,
                    MaxStock = i.ProductVariant?.Stock ?? 0
                }).ToList()
            };
        }
    }
}
