using Liechtop.Application.DTOs;
using Liechtop.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Liechtop.WebAPI.Controllers
{
    [Route("api/reviews")]
    [ApiController]
    public class ReviewController : ControllerBase
    {
        private readonly IReviewService _reviewService;

        public ReviewController(IReviewService reviewService)
        {
            _reviewService = reviewService;
        }

        [HttpGet("product/{productId:guid}")]
        public async Task<IActionResult> GetByProduct(Guid productId)
        {
            var reviews = await _reviewService.GetByProductAsync(productId);
            return Ok(reviews);
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateReviewDto dto)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();

            var userId = Guid.Parse(userIdStr);
            try
            {
                var result = await _reviewService.CreateAsync(userId, dto);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize]
        [HttpGet("can-review/{productId:guid}")]
        public async Task<IActionResult> CanReview(Guid productId)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();

            var userId = Guid.Parse(userIdStr);
            var result = await _reviewService.CanUserReviewAsync(userId, productId);
            return Ok(result);
        }

        // --- Admin Endpoints ---

        [Authorize(Roles = "Admin,Owner")]
        [HttpGet("admin/all")]
        public async Task<IActionResult> GetAllAdmin()
        {
            var reviews = await _reviewService.GetAllAsync();
            return Ok(reviews);
        }

        [Authorize(Roles = "Admin,Owner")]
        [HttpDelete("admin/{id:guid}")]
        public async Task<IActionResult> DeleteAdmin(Guid id)
        {
            var result = await _reviewService.DeleteAsync(id);
            return result ? NoContent() : NotFound();
        }
    }
}
