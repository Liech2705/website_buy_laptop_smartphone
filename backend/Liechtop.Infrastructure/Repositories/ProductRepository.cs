using Liechtop.Application.DTOs;
using Liechtop.Application.Interfaces;
using Liechtop.Domain.Entities;
using Liechtop.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Liechtop.Infrastructure.Repositories
{
    public class ProductRepository : IProductRepository
    {
        private readonly AppDbContext _context;

        public ProductRepository(AppDbContext context)
        {
            _context = context;
        }

        public IQueryable<Product> GetQueryable()
            => _context.Products.AsQueryable();

        public async Task<Product?> GetByIdAsync(Guid id)
        {
            return await _context.Products
                .Include(p => p.Brand)
                .Include(p => p.Category).ThenInclude(c => c.Parent)
                .Include(p => p.Images)
                .Include(p => p.Variants)
                .Include(p => p.AttributeValues).ThenInclude(av => av.ProductAttribute)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<Product> CreateAsync(Product product)
        {
            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            return product;
        }

        public async Task UpdateAsync(Product product)
        {
            _context.Products.Update(product);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product != null)
            {
                _context.Products.Remove(product);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<Guid?> GetBrandIdByNameAsync(string brandName)
        {
            var brand = await _context.Brands
                .Where(b => b.Name == brandName)
                .FirstOrDefaultAsync();
            return brand?.Id;
        }

        public async Task ReplaceImagesAsync(Guid productId, IEnumerable<string> imageUrls)
        {
            var existing = await _context.ProductImages.Where(i => i.ProductId == productId).ToListAsync();
            _context.ProductImages.RemoveRange(existing);
            var newImages = imageUrls.Select(url => new ProductImage { Id = Guid.NewGuid(), ProductId = productId, ImageUrl = url });
            await _context.ProductImages.AddRangeAsync(newImages);
            await _context.SaveChangesAsync();
        }

        public async Task UpsertVariantsAsync(Guid productId, IEnumerable<VariantInputDto> variants)
        {
            var existingVariants = await _context.ProductVariants.Where(v => v.ProductId == productId).ToListAsync();
            var dtoList = variants.ToList();
            var keepIds = new HashSet<Guid>();

            foreach (var vDto in dtoList)
            {
                if (vDto.Id.HasValue)
                {
                    var existing = existingVariants.FirstOrDefault(v => v.Id == vDto.Id.Value);
                    if (existing != null)
                    {
                        existing.Sku   = vDto.Sku;
                        existing.Price = vDto.Price;
                        existing.Stock = vDto.Stock;
                        keepIds.Add(existing.Id);
                        continue;
                    }
                }
                var newV = new ProductVariant { Id = Guid.NewGuid(), ProductId = productId, Sku = vDto.Sku, Price = vDto.Price, Stock = vDto.Stock };
                await _context.ProductVariants.AddAsync(newV);
                keepIds.Add(newV.Id);
            }

            var toRemove = existingVariants.Where(v => !keepIds.Contains(v.Id)).ToList();
            _context.ProductVariants.RemoveRange(toRemove);
            await _context.SaveChangesAsync();
        }

        public async Task<List<string>> GetAttributeNamesAsync()
        {
            return await _context.Attributes
                .Select(a => a.Name)
                .Distinct()
                .ToListAsync();
        }

        public async Task UpsertAttributesAsync(Guid productId, IEnumerable<AttributeInputDto> attributes)
        {
            // 1. Clear existing values for this product
            var existingValues = await _context.ProductAttributeValues.Where(v => v.ProductId == productId).ToListAsync();
            _context.ProductAttributeValues.RemoveRange(existingValues);

            // 2. Process each attribute input
            foreach (var attrDto in attributes)
            {
                if (string.IsNullOrWhiteSpace(attrDto.Name) || string.IsNullOrWhiteSpace(attrDto.Value)) continue;

                // Find or Create the ProductAttribute (the "Key")
                var attribute = await _context.Attributes
                    .FirstOrDefaultAsync(a => a.Name.ToLower() == attrDto.Name.ToLower());

                if (attribute == null)
                {
                    attribute = new ProductAttribute { Id = Guid.NewGuid(), Name = attrDto.Name };
                    _context.Attributes.Add(attribute);
                }

                // Create the Value link
                var val = new ProductAttributeValue
                {
                    Id = Guid.NewGuid(),
                    ProductId = productId,
                    AttributeId = attribute.Id,
                    Value = attrDto.Value
                };
                _context.ProductAttributeValues.Add(val);
            }

            await _context.SaveChangesAsync();
        }
    }
}
