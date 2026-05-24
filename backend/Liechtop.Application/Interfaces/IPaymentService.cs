using Liechtop.Application.DTOs;

namespace Liechtop.Application.Interfaces
{
    public interface IPaymentService
    {
        Task<PaymentUrlResponseDto> CreateVNPayUrlAsync(Guid userId, CreatePaymentDto dto, string ipAddress);
        Task<bool> ProcessVnpayIpnAsync(VnpayIpnRequest request);
    }
}
