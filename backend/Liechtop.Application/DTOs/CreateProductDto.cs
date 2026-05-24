namespace Liechtop.Application.DTOs
{
    public class VariantInputDto
    {
        public Guid? Id { get; set; }         // null → new variant; non-null → update existing
        public string Sku { get; set; } = null!;
        public decimal Price { get; set; }
        public int Stock { get; set; }
    }

    public class AttributeInputDto
    {
        public string Name { get; set; } = null!;  // e.g. "CPU"
        public string Value { get; set; } = null!; // e.g. "Apple M3"
    }

    public class CreateProductDto
    {
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public decimal? BasePrice { get; set; }
        public Guid? CategoryId { get; set; }
        public string? BrandName { get; set; }          // accept name string instead of BrandId for admin UI simplicity
        public List<string> ImageUrls { get; set; } = new();
        public List<VariantInputDto> Variants { get; set; } = new();
        public List<AttributeInputDto> Attributes { get; set; } = new();
    }
}
