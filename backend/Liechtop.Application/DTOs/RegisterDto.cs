using System.ComponentModel.DataAnnotations;

namespace Liechtop.Application.DTOs
{
    public class RegisterDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = null!;

        [Required]
        [MinLength(6, ErrorMessage = "Password phải có ít nhất 6 ký tự")]
        public string Password { get; set; } = null!;

        public string? FullName { get; set; }
    }
}
