using System.ComponentModel.DataAnnotations;

namespace Liechtop.Application.DTOs
{
    public class AddressDto
    {
        [Required]
        public string FullName { get; set; } = null!;
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
    }

    public class CreateOrderDto
    {
        public Guid? ExistingAddressId { get; set; }
        public AddressDto? NewAddress { get; set; }
        public string? Note { get; set; }
        public string? PaymentMethod { get; set; }

        [Required, MinLength(1)]
        public List<CreateOrderItemDto> Items { get; set; } = new();
        public List<string>? VoucherCodes { get; set; }
        public bool IsBuyNow { get; set; }
        public decimal? ShippingFee { get; set; }
    }

    public class CreateOrderItemDto
    {
        [Required]
        public Guid ProductVariantId { get; set; }
        [Required, Range(1, 100)]
        public int Quantity { get; set; }
        [Required, Range(0, double.MaxValue)]
        public decimal Price { get; set; }
    }

    public class OrderItemDto
    {
        public Guid Id { get; set; }
        public Guid ProductVariantId { get; set; }
        public Guid? ProductId { get; set; }
        public string ProductName { get; set; } = null!;
        public string ImageUrl { get; set; } = null!;
        public decimal PriceAtPurchase { get; set; }
        public int Quantity { get; set; }
        public decimal TotalPrice => PriceAtPurchase * Quantity;
    }

    public class RefundRequestDto
    {
        public Guid Id { get; set; }
        public Guid OrderId { get; set; }
        public string BankName { get; set; } = string.Empty;
        public string AccountNumber { get; set; } = string.Empty;
        public string AccountName { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string? Reason { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? ProcessedAt { get; set; }
    }

    public class CancelOrderRequestDto
    {
        public string? BankName { get; set; }
        public string? AccountNumber { get; set; }
        public string? AccountName { get; set; }
        public string? Reason { get; set; }
    }

    public class OrderDto
    {
        public Guid Id { get; set; }
        public string OrderNumber { get; set; } = null!;
        public string? Email { get; set; }
        public string? FullName { get; set; }
        public string? Phone { get; set; }
        public string? ShippingAddress { get; set; }
        public decimal TotalPrice { get; set; }
        public string Status { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        
        public DateTime? PaidAt { get; set; }
        public DateTime? ShippedAt { get; set; }
        public DateTime? DeliveredAt { get; set; }
        public DateTime? CancelledAt { get; set; }
        public string? TrackingCode { get; set; }
        public string? ShippingProvider { get; set; }
        
        public decimal? DiscountAmount { get; set; }
        public string? AppliedVoucherCode { get; set; }
        public decimal GrandTotal => TotalPrice - (DiscountAmount ?? 0);

        public List<OrderItemDto> Items { get; set; } = new();
        public RefundRequestDto? RefundRequest { get; set; }
    }
}
