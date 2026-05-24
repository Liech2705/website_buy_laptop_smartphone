using Liechtop.Application.DTOs;

namespace Liechtop.Application.Interfaces
{
    public interface IUserService
    {
        Task<(IEnumerable<UserDto> Users, int TotalCount)> GetPagedUsersAsync(int page, int pageSize, string? roleFilterName);
        Task<UserDto> GetUserByIdAsync(Guid id);
        Task<bool> AssignRoleAsync(Guid currentAdminId, Guid targetUserId, string roleName);
        Task<UserDto> UpdateProfileAsync(Guid userId, UpdateUserDto dto);
        Task<bool> ChangePasswordAsync(Guid userId, ChangePasswordDto dto);
    }
}
