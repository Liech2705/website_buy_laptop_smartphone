namespace Liechtop.Domain.Entities
{
    /// <summary>
    /// Maps to the "attributes" table in Supabase.
    /// Named ProductAttribute to avoid conflict with System.Attribute.
    /// </summary>
    public class ProductAttribute
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;

        public List<AttributeValue> Values { get; set; } = new();
    }
}
