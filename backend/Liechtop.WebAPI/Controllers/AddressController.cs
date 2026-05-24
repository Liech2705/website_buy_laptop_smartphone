using System.Security.Claims;
using Liechtop.Application.DTOs;
using Liechtop.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Liechtop.WebAPI.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/addresses")]
    public class AddressController : ControllerBase
    {
        private readonly IAddressService _addressService;

        public AddressController(IAddressService addressService)
        {
            _addressService = addressService;
        }

        private Guid GetUserId()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr)) throw new UnauthorizedAccessException();
            return Guid.Parse(userIdStr);
        }

        [HttpGet]
        public async Task<IActionResult> GetMyAddresses()
        {
            var addresses = await _addressService.GetUserAddressesAsync(GetUserId());
            return Ok(addresses);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetAddress(Guid id)
        {
            var address = await _addressService.GetAddressByIdAsync(id);
            return Ok(address);
        }

        [HttpPost]
        public async Task<IActionResult> CreateAddress([FromBody] CreateAddressDto dto)
        {
            var address = await _addressService.CreateAddressAsync(GetUserId(), dto);
            return CreatedAtAction(nameof(GetAddress), new { id = address.Id }, address);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAddress(Guid id, [FromBody] CreateAddressDto dto)
        {
            var address = await _addressService.UpdateAddressAsync(id, GetUserId(), dto);
            return Ok(address);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAddress(Guid id)
        {
            await _addressService.DeleteAddressAsync(id, GetUserId());
            return NoContent();
        }

        [HttpPatch("{id}/default")]
        public async Task<IActionResult> SetDefault(Guid id)
        {
            await _addressService.SetDefaultAddressAsync(id, GetUserId());
            return Ok(new { message = "Set default address successful." });
        }
    }
}
