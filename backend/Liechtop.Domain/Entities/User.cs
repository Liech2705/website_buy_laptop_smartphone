namespace Liechtop.Domain.Entities
{
    public class User
    {
        public Guid Id { get; set; }
        public string Email { get; set; } = null!;
        public string PasswordHash { get; set; } = null!;
        public string? FullName { get; set; }
        public string? Phone { get; set; }
        public string? Gender { get; set; }
        public DateOnly? DateOfBirth { get; set; }
        public Guid? RoleId { get; set; }
        public DateTime? CreatedAt { get; set; }
        public bool IsEmailVerified { get; set; } = false;

        public Role? Role { get; set; }
        public Cart? Cart { get; set; }
        public List<Address> Addresses { get; set; } = new();
        public List<Order> Orders { get; set; } = new();
        public List<Review> Reviews { get; set; } = new();
    }
}
