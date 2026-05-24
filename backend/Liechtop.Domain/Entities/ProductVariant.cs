namespace Liechtop.Domain.Entities
{
    public class ProductVariant
    {
        public Guid Id { get; set; }
        public Guid? ProductId { get; set; }
        public string Sku { get; set; } = null!;
        public decimal Price { get; set; }
        public int? Stock { get; set; }

        public Product? Product { get; set; }
        public List<CartItem> CartItems { get; set; } = new();
        public List<OrderItem> OrderItems { get; set; } = new();
    }
}
