using Liechtop.Application.DTOs;
using Liechtop.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Liechtop.WebAPI.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        /// <summary>
        /// Đăng ký tài khoản mới — gửi OTP xác minh về email.
        /// </summary>
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            try
            {
                await _authService.RegisterAsync(dto);
                return Ok(new { message = "Đăng ký thành công! Vui lòng kiểm tra email để xác minh tài khoản." });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Xác minh tài khoản bằng OTP.
        /// </summary>
        [HttpPost("verify-account")]
        public async Task<IActionResult> VerifyAccount([FromBody] VerifyAccountDto dto)
        {
            try
            {
                await _authService.VerifyAccountAsync(dto);
                return Ok(new { message = "Tài khoản đã được xác minh thành công!" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Gửi lại OTP xác minh tài khoản.
        /// </summary>
        [HttpPost("resend-verification")]
        public async Task<IActionResult> ResendVerification([FromBody] ForgotPasswordDto dto)
        {
            try
            {
                await _authService.ResendVerificationOtpAsync(dto.Email);
                return Ok(new { message = "Mã OTP xác minh đã được gửi lại." });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Đăng nhập — trả về JWT token.
        /// </summary>
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            try
            {
                var result = await _authService.LoginAsync(dto);
                return Ok(result);
            }
            catch (InvalidOperationException ex) when (ex.Message.StartsWith("EMAIL_NOT_VERIFIED:"))
            {
                var email = ex.Message.Replace("EMAIL_NOT_VERIFIED:", "");
                return StatusCode(403, new { code = "EMAIL_NOT_VERIFIED", email, message = "Email chưa được xác minh." });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
        {
            try
            {
                await _authService.ForgotPasswordAsync(dto.Email);
                return Ok(new { message = "Mã OTP đã được gửi đến email của bạn." });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
        {
            try
            {
                var result = await _authService.ResetPasswordAsync(dto);
                if (result) return Ok(new { message = "Mật khẩu đã được đặt lại thành công." });
                return BadRequest(new { message = "Không thể đặt lại mật khẩu." });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
