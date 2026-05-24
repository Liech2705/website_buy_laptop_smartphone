namespace Liechtop.Application.DTOs
{
    public class UpdateTrackingDto
    {
        public string Status { get; set; } = null!;
        public string? TrackingCode { get; set; }
        public string? ShippingProvider { get; set; }
    }
}
