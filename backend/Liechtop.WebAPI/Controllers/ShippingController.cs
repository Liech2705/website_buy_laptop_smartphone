using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Liechtop.WebAPI.Controllers
{
    [ApiController]
    [Route("api/shipping")]
    public class ShippingController : ControllerBase
    {
        [AllowAnonymous]
        [HttpGet("calculate")]
        public IActionResult CalculateShipping([FromQuery] string? province)
        {
            decimal fee = 30000; // default fee 30,000₫
            
            if (!string.IsNullOrEmpty(province))
            {
                var p = province.ToLower();
                if (p.Contains("hà nội") || p.Contains("hồ chí minh") || p.Contains("hcm") || p.Contains("hn"))
                {
                    fee = 20000; // Major cities -> 20,000₫
                }
                else
                {
                    fee = 35000; // Other provinces -> 35,000₫
                }
            }

            return Ok(new { fee });
        }
    }
}
