using Liechtop.Application.Interfaces;
using Liechtop.Domain.Entities;
using Liechtop.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Liechtop.Infrastructure.Repositories
{
    public class CartRepository : ICartRepository
    {
        private readonly AppDbContext _context;

        public CartRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Cart?> GetCartByUserIdAsync(Guid userId)
        {
            return await _context.Carts
                .Include(c => c.Items)
                    .ThenInclude(i => i.ProductVariant)
                        .ThenInclude(v => v.Product)
                            .ThenInclude(p => p.Images)
                .FirstOrDefaultAsync(c => c.UserId == userId);
        }

        public async Task<Cart> CreateCartAsync(Guid userId)
        {
            var cart = new Cart
            {
                Id = Guid.NewGuid(),
                UserId = userId
            };
            
            await _context.Carts.AddAsync(cart);
            await _context.SaveChangesAsync();
            return cart;
        }

        public async Task UpdateCartAsync(Cart cart)
        {
            _context.Carts.Update(cart);
            await _context.SaveChangesAsync();
        }

        public async Task<ProductVariant?> GetVariantByIdAsync(Guid variantId)
        {
            return await _context.ProductVariants
                .Include(v => v.Product)
                    .ThenInclude(p => p.Images)
                .FirstOrDefaultAsync(v => v.Id == variantId);
        }
    }
}
