namespace Liechtop.Domain.Entities
{
    public class Order
    {
        public Guid Id { get; set; }
        public Guid? UserId { get; set; }
        public Guid? AddressId { get; set; }
        public decimal? TotalPrice { get; set; }
        public string? Status { get; set; }
        public DateTime? CreatedAt { get; set; }

        // --- Guest checkout info (when UserId is null) ---
        public string? GuestFullName { get; set; }
        public string? GuestEmail { get; set; }
        public string? GuestPhone { get; set; }
        public string? GuestAddress { get; set; }
        public string? Note { get; set; }
        public string? PaymentMethod { get; set; }
        public string? OrderNumber { get; set; }
        public decimal? DiscountAmount { get; set; }
        public string? AppliedVoucherCode { get; set; }

        // --- Order Lifecycle Tracking ---
        public DateTime? PaidAt { get; set; }
        public DateTime? ShippedAt { get; set; }
        public DateTime? DeliveredAt { get; set; }
        public DateTime? CancelledAt { get; set; }
        public string? TrackingCode { get; set; }
        public string? ShippingProvider { get; set; }

        public User? User { get; set; }
        public Address? Address { get; set; }
        public List<OrderItem> Items { get; set; } = new();
        public Payment? Payment { get; set; }
        public RefundRequest? RefundRequest { get; set; }
    }
}
