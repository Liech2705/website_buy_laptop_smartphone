using Liechtop.Application.DTOs;
using Liechtop.Application.Interfaces;
using Liechtop.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Liechtop.Application.Services
{
    public class ProductService : IProductService
    {
        private readonly IProductRepository _repo;

        public ProductService(IProductRepository repo)
        {
            _repo = repo;
        }

        public async Task<PagedResult<ProductDto>> GetPagedAsync(ProductQuery query)
        {
            IQueryable<Product> q = _repo.GetQueryable()
                .Include(p => p.Brand)
                .Include(p => p.Category).ThenInclude(c => c.Parent)
                .Include(p => p.Images)
                .Include(p => p.Variants);

            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                var keyword = query.Search.Trim().ToLower();
                q = q.Where(p => p.Name.ToLower().Contains(keyword));
            }

            if (query.CategoryId.HasValue)
                q = q.Where(p => p.CategoryId == query.CategoryId.Value);

            if (query.BrandId.HasValue)
                q = q.Where(p => p.BrandId == query.BrandId.Value);

            if (query.MinPrice.HasValue)
                q = q.Where(p => p.BasePrice >= query.MinPrice.Value);

            if (query.MaxPrice.HasValue)
                q = q.Where(p => p.BasePrice <= query.MaxPrice.Value);

            if (query.InStock == true)
                q = q.Where(p => p.Variants.Any(v => v.Stock > 0));

            q = query.Sort switch
            {
                "price_asc"  => q.OrderBy(p => p.BasePrice),
                "price_desc" => q.OrderByDescending(p => p.BasePrice),
                "newest"     => q.OrderByDescending(p => p.Id),
                _            => q.OrderBy(p => p.Name)
            };

            var total = await q.CountAsync();
            var page     = query.Page < 1 ? 1 : query.Page;
            var pageSize = query.PageSize;

            var products = await q
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return new PagedResult<ProductDto>
            {
                Data     = products.Select(MapToDto).ToList(),
                Total    = total,
                Page     = page,
                PageSize = pageSize
            };
        }

        public async Task<ProductDto?> GetByIdAsync(Guid id)
        {
            var product = await _repo.GetByIdAsync(id);
            return product is null ? null : MapToDto(product);
        }

        public async Task<ProductDto> CreateAsync(CreateProductDto dto)
        {
            var product = new Product
            {
                Id          = Guid.NewGuid(),
                Name        = dto.Name,
                Description = dto.Description,
                BasePrice   = dto.BasePrice,
                CategoryId  = dto.CategoryId,
                BrandId     = dto.BrandName != null
                    ? await _repo.GetBrandIdByNameAsync(dto.BrandName)
                    : (Guid?)null,
                Images   = dto.ImageUrls.Select(url => new ProductImage { Id = Guid.NewGuid(), ImageUrl = url }).ToList(),
                Variants = dto.Variants.Select(v => new ProductVariant { Id = Guid.NewGuid(), Sku = v.Sku, Price = v.Price, Stock = v.Stock }).ToList(),
            };

            await _repo.CreateAsync(product);
            
            // Handle Attributes
            if (dto.Attributes != null && dto.Attributes.Count > 0)
            {
                await _repo.UpsertAttributesAsync(product.Id, dto.Attributes);
            }

            return MapToDto(await _repo.GetByIdAsync(product.Id) ?? product);
        }

        public async Task<ProductDto> UpdateAsync(Guid id, UpdateProductDto dto)
        {
            var product = await _repo.GetByIdAsync(id);
            if (product == null) throw new KeyNotFoundException("Product not found");

            product.Name        = dto.Name;
            product.Description = dto.Description;
            product.BasePrice   = dto.BasePrice;
            product.CategoryId  = dto.CategoryId;
            product.BrandId     = dto.BrandName != null
                ? await _repo.GetBrandIdByNameAsync(dto.BrandName)
                : (Guid?)null;

            await _repo.UpdateAsync(product);
            await _repo.ReplaceImagesAsync(id, dto.ImageUrls);
            await _repo.UpsertVariantsAsync(id, dto.Variants);
            
            // Handle Attributes
            await _repo.UpsertAttributesAsync(id, dto.Attributes);

            return MapToDto(await _repo.GetByIdAsync(id) ?? product);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var product = await _repo.GetByIdAsync(id);
            if (product == null) return false;
            await _repo.DeleteAsync(id);
            return true;
        }

        public async Task<List<string>> GetAvailableAttributeNamesAsync()
        {
            return await _repo.GetAttributeNamesAsync();
        }

        private static ProductDto MapToDto(Product p) => new()
        {
            Id           = p.Id,
            Name         = p.Name,
            Description  = p.Description,
            BasePrice    = p.BasePrice,
            CategoryId   = p.CategoryId,
            BrandId      = p.BrandId,
            BrandName    = p.Brand?.Name,
            CategoryName = p.Category?.Name,
            ParentCategoryId   = p.Category?.ParentId,
            ParentCategoryName = p.Category?.Parent?.Name,
            ImageUrls    = p.Images.Select(i => i.ImageUrl ?? "").ToList(),
            Variants     = p.Variants.Select(v => new ProductVariantDto
            {
                Id    = v.Id,
                Sku   = v.Sku,
                Price = v.Price,
                Stock = v.Stock
            }).ToList(),
            Attributes = p.AttributeValues?.Select(av => new ProductAttributeDto
            {
                Name = av.ProductAttribute?.Name ?? "Unknown",
                Value = av.Value ?? ""
            }).ToList() ?? new()
        };
    }
}
