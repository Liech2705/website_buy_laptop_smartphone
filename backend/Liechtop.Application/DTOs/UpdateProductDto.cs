namespace Liechtop.Application.DTOs
{
    public class UpdateProductDto
    {
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public decimal? BasePrice { get; set; }
        public Guid? CategoryId { get; set; }
        public string? BrandName { get; set; }
        public List<string> ImageUrls { get; set; } = new();
        public List<VariantInputDto> Variants { get; set; } = new();
        public List<AttributeInputDto> Attributes { get; set; } = new();
    }
}
