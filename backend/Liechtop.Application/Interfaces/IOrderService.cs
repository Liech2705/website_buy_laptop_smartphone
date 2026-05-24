using Liechtop.Application.DTOs;

namespace Liechtop.Application.Interfaces
{
    public interface IOrderService
    {
        Task<OrderDto> CheckoutAsync(Guid userId, CreateOrderDto dto);
        Task<OrderDto> GuestCheckoutAsync(GuestCreateOrderDto dto, Guid? userId = null);
        Task<List<OrderDto>> GetMyOrdersAsync(Guid userId);
        Task<OrderDto> GetMyOrderDetailsAsync(Guid userId, Guid orderId);

        // Admin
        Task<(IEnumerable<OrderDto> Orders, int TotalCount)> GetAllOrdersAsync(int page, int pageSize, string? status);
        Task<bool> AdminUpdateOrderStatusAsync(Guid orderId, UpdateTrackingDto dto);
        Task<bool> AdminConfirmCancelAndRestockAsync(Guid orderId);
        Task<AdminStatsDto> GetAdminStatsAsync();
        Task<OrderDto> GetAdminOrderDetailsAsync(Guid orderId);
        Task<bool> AdminConfirmRefundAsync(Guid orderId);

        // User
        Task<bool> UserCancelOrderAsync(Guid userId, Guid orderId, CancelOrderRequestDto? dto);
    }
}
