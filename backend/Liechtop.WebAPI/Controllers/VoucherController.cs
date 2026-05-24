using Liechtop.Application.DTOs;
using Liechtop.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Liechtop.WebAPI.Controllers
{
    [Route("api/vouchers")]
    [ApiController]
    public class VoucherController : ControllerBase
    {
        private readonly IVoucherService _voucherService;

        public VoucherController(IVoucherService voucherService)
        {
            _voucherService = voucherService;
        }

        private Guid GetUserId() =>
            Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // ─── Admin Endpoints ────────────────────────────────────────────

        [Authorize(Roles = "Admin,Owner")]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var vouchers = await _voucherService.GetAllAsync();
            return Ok(vouchers);
        }

        [Authorize(Roles = "Admin,Owner")]
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var voucher = await _voucherService.GetByIdAsync(id);
            if (voucher == null) return NotFound();
            return Ok(voucher);
        }

        [Authorize(Roles = "Admin,Owner")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateVoucherDto dto)
        {
            try
            {
                var result = await _voucherService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize(Roles = "Admin,Owner")]
        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] CreateVoucherDto dto)
        {
            try
            {
                var result = await _voucherService.UpdateAsync(id, dto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize(Roles = "Admin,Owner")]
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _voucherService.DeleteAsync(id);
            return result ? NoContent() : NotFound();
        }

        // ─── User Wallet Endpoints ──────────────────────────────────────

        /// <summary>Get all vouchers in the current user's wallet.</summary>
        [Authorize]
        [HttpGet("my-vouchers")]
        public async Task<IActionResult> GetMyVouchers()
        {
            var result = await _voucherService.GetMyVouchersAsync(GetUserId());
            return Ok(result);
        }

        /// <summary>Save a voucher into the current user's wallet by code.</summary>
        [Authorize]
        [HttpPost("save")]
        public async Task<IActionResult> SaveVoucher([FromBody] SaveVoucherDto dto)
        {
            try
            {
                var result = await _voucherService.SaveVoucherAsync(GetUserId(), dto.Code);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // ─── Checkout Validation ─────────────────────────────────────────

        /// <summary>Validate and calculate discount for a voucher at checkout. Requires login.</summary>
        [Authorize]
        [HttpGet("validate")]
        public async Task<IActionResult> ValidateVoucher([FromQuery] string code, [FromQuery] decimal amount)
        {
            try
            {
                var result = await _voucherService.ValidateVoucherAsync(code, amount, GetUserId());
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Lỗi kiểm tra mã giảm giá: " + ex.Message });
            }
        }
    }

    // Simple DTO for save voucher request
    public class SaveVoucherDto
    {
        public string Code { get; set; } = null!;
    }
}
