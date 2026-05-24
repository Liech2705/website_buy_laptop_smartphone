using System.ComponentModel.DataAnnotations;

namespace Liechtop.Application.DTOs
{
    public class AddToCartDto
    {
        [Required]
        public Guid ProductVariantId { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Số lượng phải lớn hơn 0")]
        public int Quantity { get; set; }
    }

    public class UpdateCartItemDto
    {
        [Range(0, int.MaxValue, ErrorMessage = "Số lượng không được âm")]
        public int Quantity { get; set; }
    }

    public class CartItemDto
    {
        public Guid Id { get; set; }
        public Guid ProductVariantId { get; set; }
        public string ProductName { get; set; } = null!;
        public string Sku { get; set; } = null!;
        public string ImageUrl { get; set; } = null!;
        public decimal Price { get; set; }
        public int Quantity { get; set; }
        public int MaxStock { get; set; }
        public decimal TotalPrice => Price * Quantity;
    }

    public class CartDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public List<CartItemDto> Items { get; set; } = new();
        public decimal CartTotal => Items.Sum(i => i.TotalPrice);
    }
}
