using System.ComponentModel.DataAnnotations;

namespace Liechtop.Application.DTOs
{
    public class UpdateUserDto
    {
        [Required]
        public string FullName { get; set; } = null!;

        [Phone]
        public string? Phone { get; set; }

        public string? Gender { get; set; }

        public string? DateOfBirth { get; set; }
    }
}
