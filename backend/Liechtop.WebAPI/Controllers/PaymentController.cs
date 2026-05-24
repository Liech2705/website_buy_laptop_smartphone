using System.Security.Claims;
using Liechtop.Application.DTOs;
using Liechtop.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Liechtop.WebAPI.Controllers
{
    [ApiController]
    [Route("api/payments")]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentService _paymentService;

        public PaymentController(IPaymentService paymentService)
        {
            _paymentService = paymentService;
        }

        private Guid GetUserId()
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!Guid.TryParse(userIdString, out var userId))
            {
                throw new UnauthorizedAccessException("Invalid User Token");
            }
            return userId;
        }

        /// <summary>
        /// Tạo URL Thanh toán VNPay (Giả lập) từ Order đã tạo
        /// CẦN AUTHENTICATION JWT
        /// </summary>
        [Authorize]
        [HttpPost("create-vnpay-url")]
        public async Task<IActionResult> CreateVnPayUrl([FromBody] CreatePaymentDto dto)
        {
            try
            {
                var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
                if (ipAddress == "::1") ipAddress = "127.0.0.1";

                var response = await _paymentService.CreateVNPayUrlAsync(GetUserId(), dto, ipAddress);
                return Ok(response);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Endpoint dùng để VNPay (Hoặc Momo) chủ động gọi ngầm tới để báo trạng thái tiền (IPN/Webhook)
        /// VÌ BÊN THỨ 3 GỌI NÊN KHÔNG ĐƯỢC CHẶN AUTHENTICATION.
        /// NHƯNG PHẢI CHECK CỰC, CỰC KỲ CHẶT CHẼ `VnpSecureHash`!!!
        /// </summary>
        [AllowAnonymous]
        [HttpGet("vnpay-ipn")]
        public async Task<IActionResult> VnpayIpn([FromQuery] VnpayIpnRequest request)
        {
            try
            {
                bool isValid = await _paymentService.ProcessVnpayIpnAsync(request);

                if (isValid)
                {
                    // Chữ ký hợp lệ và Giao dịch OK -> Báo lại VNPay mã "00" để họ xác nhận IPN thành công
                    return Ok(new { RspCode = "00", Message = "Confirm Success" });
                }
                else
                {
                    // Lỗi gì đó: Sai Hash, Tìm không ra Order, hay User ko đủ tiền,...
                    return Ok(new { RspCode = "97", Message = "Invalid Checksum or Transaction Failed" });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                return Ok(new { RspCode = "99", Message = "Unknow Error" });
            }
        }
    }
}
