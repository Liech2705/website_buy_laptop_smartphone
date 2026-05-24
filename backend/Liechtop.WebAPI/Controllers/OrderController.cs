using System.Security.Claims;
using Liechtop.Application.DTOs;
using Liechtop.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Liechtop.WebAPI.Controllers
{
    [Route("api/orders")]
    [ApiController]
    public class OrderController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public OrderController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        [AllowAnonymous]
        [HttpPost("guest")]
        public async Task<IActionResult> GuestCheckout([FromBody] GuestCreateOrderDto dto)
        {
            try
            {
                Guid? userId = User.Identity?.IsAuthenticated == true ? GetUserId() : null;
                var result = await _orderService.GuestCheckoutAsync(dto, userId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> Checkout([FromBody] CreateOrderDto dto)
        {
            try
            {
                var result = await _orderService.CheckoutAsync(GetUserId(), dto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize]
        [HttpGet("my")]
        public async Task<IActionResult> GetMyOrders()
        {
            var orders = await _orderService.GetMyOrdersAsync(GetUserId());
            return Ok(orders);
        }

        [Authorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetOrderDetails(Guid id)
        {
            try
            {
                var order = await _orderService.GetMyOrderDetailsAsync(GetUserId(), id);
                return Ok(order);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [Authorize]
        [HttpPost("{id}/cancel")]
        public async Task<IActionResult> CancelOrder(Guid id, [FromBody] CancelOrderRequestDto? dto = null)
        {
            try
            {
                await _orderService.UserCancelOrderAsync(GetUserId(), id, dto);
                return Ok(new { message = "Huỷ đơn hàng thành công. Hệ thống đã cập nhật trạng thái." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // ======================= ADMIN =======================
        [Authorize(Roles = "Admin,Owner")]
        [HttpGet("all")]
        public async Task<IActionResult> GetAllOrders([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string? status = null)
        {
            var result = await _orderService.GetAllOrdersAsync(page, pageSize, status);
            return Ok(new { data = result.Orders, total = result.TotalCount });
        }

        [Authorize(Roles = "Admin,Owner")]
        [HttpGet("stats")]
        public async Task<IActionResult> GetAdminStats()
        {
            var stats = await _orderService.GetAdminStatsAsync();
            return Ok(stats);
        }

        [Authorize(Roles = "Admin,Owner")]
        [HttpGet("admin/{id:guid}")]
        public async Task<IActionResult> GetOrderDetailAdmin(Guid id)
        {
            try
            {
                var order = await _orderService.GetAdminOrderDetailsAsync(id);
                return Ok(order);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [Authorize(Roles = "Admin,Owner")]
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateTrackingDto dto)
        {
            try
            {
                await _orderService.AdminUpdateOrderStatusAsync(id, dto);
                return Ok(new { message = "Cập nhật trạng thái thành công" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize(Roles = "Admin,Owner")]
        [HttpPost("{id}/restock")]
        public async Task<IActionResult> ConfirmRestock(Guid id)
        {
            try
            {
                await _orderService.AdminConfirmCancelAndRestockAsync(id);
                return Ok(new { message = "Đã xác nhận huỷ và hoàn trả kho thành công" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize(Roles = "Admin,Owner")]
        [HttpPost("{id}/refund-confirm")]
        public async Task<IActionResult> ConfirmRefund(Guid id)
        {
            try
            {
                await _orderService.AdminConfirmRefundAsync(id);
                return Ok(new { message = "Đã xác nhận hoàn tiền và huỷ đơn hàng thành công" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        private Guid GetUserId()
        {
            var claim = User.Claims.FirstOrDefault(c => c.Type == "id" || c.Type == ClaimTypes.NameIdentifier);
            if (claim == null) throw new UnauthorizedAccessException();
            return Guid.Parse(claim.Value);
        }
    }
}
