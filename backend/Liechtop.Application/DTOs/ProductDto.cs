namespace Liechtop.Application.DTOs
{
    public class ProductDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public decimal? BasePrice { get; set; }
        public Guid? CategoryId { get; set; }       // for admin form pre-select
        public Guid? BrandId { get; set; }           // for admin form pre-select
        public string? BrandName { get; set; }
        public string? CategoryName { get; set; }
        public Guid? ParentCategoryId { get; set; }
        public string? ParentCategoryName { get; set; }
        public List<string> ImageUrls { get; set; } = new();
        public List<ProductVariantDto> Variants { get; set; } = new();
        public List<ProductAttributeDto> Attributes { get; set; } = new();
    }

    public class ProductVariantDto
    {
        public Guid Id { get; set; }
        public string Sku { get; set; } = null!;
        public decimal Price { get; set; }
        public int? Stock { get; set; }
    }

    public class ProductAttributeDto
    {
        public string Name { get; set; } = null!;
        public string Value { get; set; } = null!;
    }
}
