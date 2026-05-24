using System.ComponentModel.DataAnnotations;

namespace Liechtop.Application.DTOs
{
    public class UserAddressDto
    {
        public Guid Id { get; set; }
        
        [Required]
        public string FullName { get; set; } = null!;
        
        [Required]
        [Phone]
        public string Phone { get; set; } = null!;

        [Required]
        public string Province { get; set; } = null!;

        [Required]
        public string District { get; set; } = null!;

        [Required]
        public string Ward { get; set; } = null!;

        [Required]
        public string DetailAddress { get; set; } = null!;

        public bool IsDefault { get; set; }
    }

    public class CreateAddressDto
    {
        [Required]
        public string FullName { get; set; } = null!;
        
        [Required]
        [Phone]
        public string Phone { get; set; } = null!;

        [Required]
        public string Province { get; set; } = null!;

        [Required]
        public string District { get; set; } = null!;

        [Required]
        public string Ward { get; set; } = null!;

        [Required]
        public string DetailAddress { get; set; } = null!;

        public bool IsDefault { get; set; }
    }
}
