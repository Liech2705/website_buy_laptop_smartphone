namespace Liechtop.Domain.Entities
{
    public class Product
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public decimal? BasePrice { get; set; }
        public Guid? BrandId { get; set; }
        public Guid? CategoryId { get; set; }

        public Brand? Brand { get; set; }
        public Category? Category { get; set; }
        public List<ProductVariant> Variants { get; set; } = new();
        public List<ProductImage> Images { get; set; } = new();
        public List<Review> Reviews { get; set; } = new();
        public List<ProductAttributeValue> AttributeValues { get; set; } = new();
    }
}
