namespace Liechtop.Domain.Entities
{
    /// <summary>
    /// Stores a product-level attribute key-value pair.
    /// E.g. Product "Laptop X" has RAM = "16GB", CPU = "Intel i7"
    /// </summary>
    public class ProductAttributeValue
    {
        public Guid Id { get; set; }
        public Guid ProductId { get; set; }
        public Guid AttributeId { get; set; }
        public string? Value { get; set; }

        public Product Product { get; set; } = null!;
        public ProductAttribute? ProductAttribute { get; set; }
    }
}
