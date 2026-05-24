namespace Liechtop.Domain.Entities
{
    public class Address
    {
        public Guid Id { get; set; }
        public Guid? UserId { get; set; }
        public string? FullName { get; set; }
        public string? Phone { get; set; }
        public string? Province { get; set; }
        public string? District { get; set; }
        public string? Ward { get; set; }
        public string? DetailAddress { get; set; }
        public bool IsDefault { get; set; }

        public User? User { get; set; }
        public List<Order> Orders { get; set; } = new();
    }
}
