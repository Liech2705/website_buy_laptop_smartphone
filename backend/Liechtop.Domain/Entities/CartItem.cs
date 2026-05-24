namespace Liechtop.Domain.Entities
{
    public class CartItem
    {
        public Guid Id { get; set; }
        public Guid? CartId { get; set; }
        public Guid? ProductVariantId { get; set; }
        public int? Quantity { get; set; }

        public Cart? Cart { get; set; }
        public ProductVariant? ProductVariant { get; set; }
    }
}
