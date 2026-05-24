using System.ComponentModel.DataAnnotations;

namespace Liechtop.Application.DTOs
{
    public class CreatePaymentDto
    {
        [Required]
        public Guid OrderId { get; set; }
    }

    public class PaymentUrlResponseDto
    {
        public string PaymentUrl { get; set; } = null!;
        public string OrderId { get; set; } = null!;
    }
}
