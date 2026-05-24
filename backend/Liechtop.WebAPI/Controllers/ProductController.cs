using Liechtop.Application.DTOs;
using Liechtop.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Liechtop.WebAPI.Controllers
{
    [ApiController]
    [Route("api/products")]
    public class ProductController : ControllerBase
    {
        private readonly IProductService _service;

        public ProductController(IProductService service)
        {
            _service = service;
        }

        /// <summary>
        /// Lấy danh sách sản phẩm có phân trang, tìm kiếm, lọc và sắp xếp.
        /// </summary>
        /// <remarks>
        /// Query params:
        /// - search: tìm theo tên
        /// - categoryId: lọc theo danh mục
        /// - brandId: lọc theo thương hiệu
        /// - minPrice / maxPrice: lọc theo giá
        /// - inStock: true/false — chỉ lấy còn hàng
        /// - sort: price_asc | price_desc | newest
        /// - page: trang (mặc định 1)
        /// - pageSize: số item/trang (mặc định 10, tối đa 50)
        /// </remarks>
        [HttpGet]
        public async Task<IActionResult> GetPaged([FromQuery] ProductQuery query)
        {
            var result = await _service.GetPagedAsync(query);
            return Ok(result);
        }

        /// <summary>
        /// Lấy chi tiết 1 sản phẩm theo ID.
        /// </summary>
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _service.GetByIdAsync(id);
            return result is null ? NotFound() : Ok(result);
        }

        /// <summary>
        /// Tạo mới sản phẩm.
        /// </summary>
        [Authorize(Roles = "Admin,Owner")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateProductDto dto)
        {
            var result = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [Authorize(Roles = "Admin,Owner")]
        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateProductDto dto)
        {
            try
            {
                var result = await _service.UpdateAsync(id, dto);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [Authorize(Roles = "Admin,Owner")]
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _service.DeleteAsync(id);
            if (!result) return NotFound(new { message = "Sản phẩm không tồn tại." });
            return NoContent();
        }

        [Authorize(Roles = "Admin,Owner")]
        [HttpPost("upload")]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("Không có tệp nào được chọn.");

            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "products");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var request = HttpContext.Request;
            var baseUrl = $"{request.Scheme}://{request.Host}";
            var imageUrl = $"{baseUrl}/uploads/products/{fileName}";
            return Ok(new { imageUrl });
        }

        [HttpGet("attributes")]
        public async Task<IActionResult> GetAttributeNames()
        {
            var result = await _service.GetAvailableAttributeNamesAsync();
            return Ok(result);
        }
    }
}
