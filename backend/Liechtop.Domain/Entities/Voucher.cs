using System;

namespace Liechtop.Domain.Entities
{
    public class Voucher
    {
        public Guid Id { get; set; }
        public string Code { get; set; } = null!;
        public string? Description { get; set; }
        
        // Discount logic
        public decimal? DiscountAmount { get; set; }
        public decimal? DiscountPercentage { get; set; }
        public decimal? MaxDiscountAmount { get; set; } // Only used if percentage
        
        // Restrictions
        public decimal MinOrderAmount { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? ExpiryDate { get; set; }
        
        public int? UsageLimit { get; set; } // Total times it can be used system-wide
        public int? UsageLimitPerUser { get; set; } // Max times a single user can use it
        public int UsedCount { get; set; }
        
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
