namespace Liechtop.Domain.Entities
{
    /// <summary>
    /// Represents a voucher saved into a user's "Wallet" and tracks whether it has been used.
    /// </summary>
    public class UserVoucher
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public Guid VoucherId { get; set; }

        public bool IsUsed { get; set; } = false;
        public DateTime? UsedAt { get; set; }
        public DateTime SavedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public User? User { get; set; }
        public Voucher? Voucher { get; set; }
    }
}
