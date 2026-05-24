namespace Liechtop.Domain.Entities
{
    public class AttributeValue
    {
        public Guid Id { get; set; }
        public Guid? AttributeId { get; set; }
        public string? Value { get; set; }

        public ProductAttribute? Attribute { get; set; }
    }
}
