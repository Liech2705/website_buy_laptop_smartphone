using Liechtop.Application.DTOs;

namespace Liechtop.Application.Interfaces
{
    public interface IAuthService
    {
        Task<bool> RegisterAsync(RegisterDto dto);
        Task<AuthResponseDto> LoginAsync(LoginDto dto);
        Task<bool> ForgotPasswordAsync(string email);
        Task<bool> ResetPasswordAsync(ResetPasswordDto dto);
        Task<bool> VerifyAccountAsync(VerifyAccountDto dto);
        Task<bool> ResendVerificationOtpAsync(string email);
    }
}
