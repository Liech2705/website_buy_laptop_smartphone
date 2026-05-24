using Liechtop.Application.DTOs;
using Liechtop.Domain.Entities;

namespace Liechtop.Application.Interfaces
{
    public interface IOrderRepository
    {
        Task<Order> CreateOrderAsync(Order order, List<OrderItem> items, Cart? cart = null);
        Task<Order> CreateGuestOrderAsync(Order order, List<OrderItem> items);
        Task<IEnumerable<Order>> GetOrdersByUserIdAsync(Guid userId);
        Task<Order?> GetOrderWithDetailsAsync(Guid userId, Guid orderId);
        
        // Cập nhật stock db-level chặn bán vượt kho (phun exception / return false nếu fail)
        Task<bool> DeductStockSafelyAsync(Guid variantId, int quantity);
        Task<Address?> GetAddressByIdAsync(Guid addressId);
        
        Task<Order?> GetOrderBasicAsync(Guid orderId);
        Task UpdateOrderAsync(Order order);

        // Admin Methods
        Task<IEnumerable<Order>> GetAllOrdersAsync(int page, int pageSize, string? status);
        Task<int> GetTotalOrdersCountAsync(string? status);
        Task RestoreStockAsync(Guid orderId);
        Task<IEnumerable<Order>> GetPendingExpiredOrdersAsync(DateTime thresholdTime);
        Task<AdminStatsDto> GetAdminStatsAsync();
        Task<Order?> GetOrderWithDetailsForAdminAsync(Guid orderId);
    }
}
