using Liechtop.Application.DTOs;
using Liechtop.Application.Interfaces;
using Liechtop.Domain.Entities;

namespace Liechtop.Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepo;
        private readonly IRoleRepository _roleRepo;
        private readonly IJwtService     _jwtService;
        private readonly IEmailService   _emailService;
        private readonly IOtpRepository  _otpRepo;

        private const string DefaultRole = "Customer";

        public AuthService(IUserRepository userRepo, IRoleRepository roleRepo, IJwtService jwtService, IEmailService emailService, IOtpRepository otpRepo)
        {
            _userRepo     = userRepo;
            _roleRepo     = roleRepo;
            _jwtService   = jwtService;
            _emailService = emailService;
            _otpRepo      = otpRepo;
        }

        public async Task<bool> ForgotPasswordAsync(string email)
        {
            var user = await _userRepo.GetByEmailAsync(email.Trim().ToLower());
            if (user == null) throw new InvalidOperationException("Email không tồn tại trong hệ thống.");

            var otpCode = new Random().Next(100000, 999999).ToString();
            var otpLog = new OtpLog
            {
                Email = user.Email,
                Code = otpCode,
                Type = "ResetPassword",
                ExpiresAt = DateTime.UtcNow.AddMinutes(10)
            };

            await _userRepo.BeginTransactionAsync();
            try 
            {
                await _otpRepo.AddAsync(otpLog);
                
                // Gửi email TRƯỚC KHI commit. Nếu mail lỗi, DB sẽ rollback.
                await _emailService.SendOtpEmailAsync(user.Email, otpCode);
                
                await _userRepo.CommitTransactionAsync();
                return true;
            }
            catch (Exception ex)
            {
                await _userRepo.RollbackTransactionAsync();
                // Log lỗi email hoặc lỗi DB tại đây nếu cần
                throw new InvalidOperationException("Hệ thống không thể gửi email xác thực lúc này. Vui lòng kiểm tra lại địa chỉ email hoặc thử lại sau.");
            }
        }

        public async Task<bool> ResetPasswordAsync(ResetPasswordDto dto)
        {
            var user = await _userRepo.GetByEmailAsync(dto.Email.Trim().ToLower());
            if (user == null) return false;

            var otp = await _otpRepo.GetLatestValidOtpAsync(user.Email, "ResetPassword");
            if (otp == null || otp.Code != dto.Otp)
                throw new InvalidOperationException("Mã OTP không hợp lệ hoặc đã hết hạn.");

            await _userRepo.BeginTransactionAsync();
            try
            {
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
                await _userRepo.UpdateUserAsync(user);

                otp.IsUsed = true;
                await _otpRepo.UpdateAsync(otp);

                await _userRepo.CommitTransactionAsync();
                return true;
            }
            catch
            {
                await _userRepo.RollbackTransactionAsync();
                throw new InvalidOperationException("Không thể đặt lại mật khẩu. Vui lòng thử lại.");
            }
        }

        public async Task<bool> RegisterAsync(RegisterDto dto)
        {
            if (await _userRepo.EmailExistsAsync(dto.Email))
                throw new InvalidOperationException("Email đã được sử dụng bởi một tài khoản khác.");

            var customerRole = await _roleRepo.GetByNameAsync(DefaultRole);
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            var user = new User
            {
                Id               = Guid.NewGuid(),
                Email            = dto.Email.Trim().ToLower(),
                PasswordHash     = passwordHash,
                FullName         = dto.FullName,
                RoleId           = customerRole?.Id,
                CreatedAt        = DateTime.UtcNow,
                IsEmailVerified  = false
            };

            var otpCode = new Random().Next(100000, 999999).ToString();
            var otpLog = new OtpLog
            {
                Email     = user.Email,
                Code      = otpCode,
                Type      = "VerifyAccount",
                ExpiresAt = DateTime.UtcNow.AddMinutes(10)
            };

            await _userRepo.BeginTransactionAsync();
            try
            {
                await _userRepo.AddAsync(user);
                await _otpRepo.AddAsync(otpLog);

                // Gửi email ngay trong transaction
                await _emailService.SendVerifyEmailAsync(user.Email, otpCode);

                await _userRepo.CommitTransactionAsync();
                return true;
            }
            catch (Exception)
            {
                await _userRepo.RollbackTransactionAsync();
                throw new InvalidOperationException("Gửi email xác minh thất bại. Tài khoản chưa được tạo, vui lòng thử lại.");
            }
        }

        public async Task<bool> VerifyAccountAsync(VerifyAccountDto dto)
        {
            var user = await _userRepo.GetByEmailAsync(dto.Email.Trim().ToLower());
            if (user == null) throw new InvalidOperationException("Email không tồn tại.");

            if (user.IsEmailVerified) return true;

            var otp = await _otpRepo.GetLatestValidOtpAsync(user.Email, "VerifyAccount");
            if (otp == null || otp.Code != dto.Otp)
                throw new InvalidOperationException("Mã OTP không hợp lệ hoặc đã hết hạn.");

            await _userRepo.BeginTransactionAsync();
            try
            {
                user.IsEmailVerified = true;
                await _userRepo.UpdateUserAsync(user);

                otp.IsUsed = true;
                await _otpRepo.UpdateAsync(otp);

                await _userRepo.CommitTransactionAsync();
                return true;
            }
            catch
            {
                await _userRepo.RollbackTransactionAsync();
                throw new InvalidOperationException("Xác minh không thành công. Vui lòng thử lại.");
            }
        }

        public async Task<bool> ResendVerificationOtpAsync(string email)
        {
            var user = await _userRepo.GetByEmailAsync(email.Trim().ToLower());
            if (user == null) throw new InvalidOperationException("Email không tồn tại.");
            if (user.IsEmailVerified) throw new InvalidOperationException("Tài khoản đã được xác minh.");

            var otpCode = new Random().Next(100000, 999999).ToString();
            var otpLog = new OtpLog
            {
                Email     = user.Email,
                Code      = otpCode,
                Type      = "VerifyAccount",
                ExpiresAt = DateTime.UtcNow.AddMinutes(10)
            };

            await _userRepo.BeginTransactionAsync();
            try
            {
                await _otpRepo.AddAsync(otpLog);
                
                await _emailService.SendVerifyEmailAsync(user.Email, otpCode);
                
                await _userRepo.CommitTransactionAsync();
                return true;
            }
            catch
            {
                await _userRepo.RollbackTransactionAsync();
                throw new InvalidOperationException("Hệ thống không thể gửi lại mã lúc này. Vui lòng thử lại sau.");
            }
        }

        public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
        {
            var user = await _userRepo.GetByEmailAsync(dto.Email.Trim().ToLower());
            if (user is null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                throw new UnauthorizedAccessException("Email hoặc mật khẩu không đúng.");

            if (!user.IsEmailVerified)
                throw new InvalidOperationException("EMAIL_NOT_VERIFIED:" + user.Email);

            var roleName = user.Role?.Name ?? DefaultRole;
            var token    = _jwtService.GenerateToken(user, roleName);

            return new AuthResponseDto
            {
                Token    = token,
                Email    = user.Email,
                FullName = user.FullName,
                Role     = roleName
            };
        }
    }
}
