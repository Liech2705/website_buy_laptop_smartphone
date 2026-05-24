using System.ComponentModel.DataAnnotations;

namespace Liechtop.Application.DTOs
{
    public class GuestOrderItemDto
    {
        [Required]
        public Guid ProductVariantId { get; set; }
        [Required, Range(1, 100)]
        public int Quantity { get; set; }
        [Required, Range(0, double.MaxValue)]
        public decimal Price { get; set; }
        public string? ProductName { get; set; }
        public string? ImageUrl { get; set; }
    }

    public class GuestCreateOrderDto
    {
        [Required]
        public string FullName { get; set; } = null!;
        [Required, EmailAddress]
        public string Email { get; set; } = null!;
        [Required]
        public string Phone { get; set; } = null!;
        [Required]
        public string Province { get; set; } = null!;
        [Required]
        public string District { get; set; } = null!;
        [Required]
        public string Ward { get; set; } = null!;
        [Required]
        public string DetailAddress { get; set; } = null!;
        public string? Note { get; set; }

        /// <summary>COD hoặc VNPAY</summary>
        [Required]
        public string PaymentMethod { get; set; } = "COD";

        [Required, MinLength(1)]
        public List<GuestOrderItemDto> Items { get; set; } = new();
        public bool IsBuyNow { get; set; }
    }
}
