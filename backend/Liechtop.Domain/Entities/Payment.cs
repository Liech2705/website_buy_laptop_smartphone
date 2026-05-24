namespace Liechtop.Domain.Entities
{
    public class Payment
    {
        public Guid Id { get; set; }
        public Guid? OrderId { get; set; }
        public string? Method { get; set; }
        public string? Status { get; set; }

        public Order? Order { get; set; }
    }
}
