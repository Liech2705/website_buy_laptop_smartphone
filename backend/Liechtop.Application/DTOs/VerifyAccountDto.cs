namespace Liechtop.Application.DTOs
{
    public class VerifyAccountDto
    {
        public string Email { get; set; } = null!;
        public string Otp { get; set; } = null!;
    }
}
