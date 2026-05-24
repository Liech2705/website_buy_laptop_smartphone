using Liechtop.Application.DTOs;
using Liechtop.Application.Interfaces;
using Liechtop.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Liechtop.Application.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepo;
        private readonly IRoleRepository _roleRepo;

        public UserService(IUserRepository userRepo, IRoleRepository roleRepo)
        {
            _userRepo = userRepo;
            _roleRepo = roleRepo;
        }

        public async Task<(IEnumerable<UserDto> Users, int TotalCount)> GetPagedUsersAsync(int page, int pageSize, string? roleFilterName)
        {
            var query = _userRepo.GetQueryable();

            if (!string.IsNullOrEmpty(roleFilterName))
            {
                query = query.Where(u => u.Role != null && u.Role.Name == roleFilterName);
            }

            int total = await query.CountAsync();
            var items = await query
                .OrderByDescending(u => u.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var dtos = items.Select(u => new UserDto
            {
                Id = u.Id,
                Email = u.Email,
                FullName = u.FullName,
                Phone = u.Phone,
                Gender = u.Gender,
                DateOfBirth = u.DateOfBirth,
                CreatedAt = u.CreatedAt,
                RoleName = u.Role?.Name
            });

            return (dtos, total);
        }

        public async Task<UserDto> GetUserByIdAsync(Guid id)
        {
            var u = await _userRepo.GetByIdAsync(id);
            if (u == null) throw new KeyNotFoundException("User not found.");

            return new UserDto
            {
                Id = u.Id,
                Email = u.Email,
                FullName = u.FullName,
                Phone = u.Phone,
                Gender = u.Gender,
                DateOfBirth = u.DateOfBirth,
                CreatedAt = u.CreatedAt,
                RoleName = u.Role?.Name
            };
        }

        public async Task<bool> AssignRoleAsync(Guid currentAdminId, Guid targetUserId, string roleName)
        {
            var targetUser = await _userRepo.GetByIdAsync(targetUserId);
            if (targetUser == null) throw new KeyNotFoundException("Tài khoản không tồn tại.");

            // 1. Chặn việc tự thay đổi hoặc hạ quyền của chính mình
            if (currentAdminId == targetUserId && roleName != targetUser.Role?.Name)
            {
                throw new InvalidOperationException("Bạn không thể tự thay đổi hoặc hạ vai trò của chính mình.");
            }

            var newRole = await _roleRepo.GetByNameAsync(roleName);
            if (newRole == null) throw new KeyNotFoundException($"Vai trò '{roleName}' không tồn tại trong hệ thống.");

            // 2. Chặn hạ quyền Owner duy nhất còn lại của hệ thống
            if (targetUser.Role?.Name == "Owner" && roleName != "Owner")
            {
                var ownerCount = await _userRepo.GetQueryable().CountAsync(u => u.Role != null && u.Role.Name == "Owner");
                if (ownerCount <= 1)
                {
                    throw new InvalidOperationException("Không thể hạ quyền tài khoản Owner duy nhất của hệ thống.");
                }
            }

            targetUser.RoleId = newRole.Id;
            await _userRepo.UpdateUserAsync(targetUser);

            return true;
        }

        public async Task<UserDto> UpdateProfileAsync(Guid userId, UpdateUserDto dto)
        {
            var user = await _userRepo.GetByIdAsync(userId);
            if (user == null) throw new KeyNotFoundException("Tài khoản không tồn tại.");

            user.FullName = dto.FullName;
            user.Phone = dto.Phone;
            user.Gender = dto.Gender;

            // Handle manual DateOfBirth parsing from string
            if (!string.IsNullOrWhiteSpace(dto.DateOfBirth))
            {
                if (DateTime.TryParse(dto.DateOfBirth, out var dt))
                {
                    user.DateOfBirth = DateOnly.FromDateTime(dt);
                }
                else
                {
                    throw new InvalidOperationException("Định dạng ngày sinh không hợp lệ. Vui lòng sử dụng yyyy-MM-dd.");
                }
            }
            else
            {
                user.DateOfBirth = null;
            }

            await _userRepo.UpdateUserAsync(user);

            return await GetUserByIdAsync(userId);
        }

        public async Task<bool> ChangePasswordAsync(Guid userId, ChangePasswordDto dto)
        {
            var user = await _userRepo.GetByIdAsync(userId);
            if (user == null) throw new KeyNotFoundException("Tài khoản không tồn tại.");

            // Verify current password
            if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
            {
                throw new InvalidOperationException("Mật khẩu hiện tại không chính xác.");
            }

            // Hash and update new password
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            await _userRepo.UpdateUserAsync(user);

            return true;
        }
    }
}
