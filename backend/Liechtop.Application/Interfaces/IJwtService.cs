using Liechtop.Domain.Entities;

namespace Liechtop.Application.Interfaces
{
    public interface IJwtService
    {
        /// <summary>
        /// Tạo JWT token chứa userId, email, role.
        /// </summary>
        string GenerateToken(User user, string roleName);
    }
}
