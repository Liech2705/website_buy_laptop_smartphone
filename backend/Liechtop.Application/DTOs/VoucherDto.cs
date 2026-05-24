using System;
using System.ComponentModel.DataAnnotations;

namespace Liechtop.Application.DTOs
{
    public class VoucherDto
    {
        public Guid Id { get; set; }
        public string Code { get; set; } = null!;
        public string? Description { get; set; }
        public decimal? DiscountAmount { get; set; }
        public decimal? DiscountPercentage { get; set; }
        public decimal? MaxDiscountAmount { get; set; }
        public decimal MinOrderAmount { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public int? UsageLimit { get; set; }
        public int? UsageLimitPerUser { get; set; }
        public int UsedCount { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateVoucherDto
    {
        [Required]
        public string Code { get; set; } = null!;
        public string? Description { get; set; }
        public decimal? DiscountAmount { get; set; }
        public decimal? DiscountPercentage { get; set; }
        public decimal? MaxDiscountAmount { get; set; }
        public decimal MinOrderAmount { get; set; } = 0;
        public DateTime? StartDate { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public int? UsageLimit { get; set; }
        public int? UsageLimitPerUser { get; set; }
        public bool IsActive { get; set; } = true;
    }

    /// <summary>Result returned after validating a voucher at checkout.</summary>
    public class ApplyVoucherResultDto
    {
        public string Code { get; set; } = null!;
        public string? Description { get; set; }
        public decimal DiscountAmount { get; set; }
        public string Message { get; set; } = null!;
        public decimal? DiscountPercentage { get; set; }
        public decimal? MaxDiscountAmount { get; set; }
    }

    /// <summary>Represents a voucher saved in a user's wallet.</summary>
    public class UserVoucherDto
    {
        public Guid Id { get; set; }
        public Guid VoucherId { get; set; }
        public bool IsUsed { get; set; }
        public DateTime? UsedAt { get; set; }
        public DateTime SavedAt { get; set; }

        // Embedded voucher info for display
        public string Code { get; set; } = null!;
        public string? Description { get; set; }
        public decimal? DiscountAmount { get; set; }
        public decimal? DiscountPercentage { get; set; }
        public decimal? MaxDiscountAmount { get; set; }
        public decimal MinOrderAmount { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public bool VoucherIsActive { get; set; }

        // Computed helpers for frontend
        public bool IsExpired => ExpiryDate.HasValue && ExpiryDate < DateTime.UtcNow;
        public bool IsNotStarted => StartDate.HasValue && StartDate > DateTime.UtcNow;
        public bool CanUse => !IsUsed && !IsExpired && !IsNotStarted && VoucherIsActive;
    }
}
