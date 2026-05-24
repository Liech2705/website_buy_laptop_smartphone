namespace Liechtop.Domain.Entities
{
    public class OrderItem
    {
        public Guid Id { get; set; }
        public Guid? OrderId { get; set; }
        public Guid? ProductVariantId { get; set; }
        public decimal? Price { get; set; }
        public int? Quantity { get; set; }

        public Order? Order { get; set; }
        public ProductVariant? ProductVariant { get; set; }
    }
}
