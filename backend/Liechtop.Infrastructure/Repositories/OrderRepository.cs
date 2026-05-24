using Liechtop.Application.DTOs;
using Liechtop.Application.Interfaces;
using Liechtop.Domain.Entities;
using Liechtop.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Liechtop.Infrastructure.Repositories
{
    public class OrderRepository : IOrderRepository
    {
        private readonly AppDbContext _context;

        public OrderRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Address?> GetAddressByIdAsync(Guid addressId)
        {
            return await _context.Addresses.FirstOrDefaultAsync(a => a.Id == addressId);
        }

        public async Task<IEnumerable<Order>> GetOrdersByUserIdAsync(Guid userId)
        {
            return await _context.Orders
                .Include(o => o.Address)
                .Include(o => o.Items)
                    .ThenInclude(i => i.ProductVariant)
                        .ThenInclude(v => v.Product)
                            .ThenInclude(p => p.Images)
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();
        }

        public async Task<Order?> GetOrderWithDetailsAsync(Guid userId, Guid orderId)
        {
            return await _context.Orders
                .Include(o => o.Address)
                .Include(o => o.Payment)
                .Include(o => o.RefundRequest)
                .Include(o => o.Items)
                    .ThenInclude(i => i.ProductVariant)
                        .ThenInclude(v => v.Product)
                            .ThenInclude(p => p.Images)
                .FirstOrDefaultAsync(o => o.UserId == userId && o.Id == orderId);
        }

        public async Task<Order?> GetOrderWithDetailsForAdminAsync(Guid orderId)
        {
            return await _context.Orders
                .Include(o => o.User)
                .Include(o => o.Address)
                .Include(o => o.Payment)
                .Include(o => o.RefundRequest)
                .Include(o => o.Items)
                    .ThenInclude(i => i.ProductVariant)
                        .ThenInclude(v => v!.Product)
                            .ThenInclude(p => p!.Images)
                .FirstOrDefaultAsync(o => o.Id == orderId);
        }

        public async Task<Order> CreateOrderAsync(Order order, List<OrderItem> items, Cart? cart = null)
        {
            // Bắt đầu Transaction mức Database bảo vệ tính nguyên vẹn (ACID)
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // 1. Gán Items vào Order
                order.Items = items;
                await _context.Orders.AddAsync(order);

                // 2. Clear giỏ hàng cũ để không bị mua lặp lại (nếu có DB Cart)
                if (cart != null && cart.Items.Any())
                {
                    _context.CartItems.RemoveRange(cart.Items);
                }

                // 3. Trừ Stock cho tất cả các items 
                // Cực kì an toàn với Raw SQL để chặn Race Condition!
                foreach (var item in items)
                {
                    if (item.ProductVariantId == null || item.Quantity == null)
                        throw new InvalidOperationException("Dữ liệu OrderItem bị thiếu.");

                    bool success = await DeductStockSafelyAsync(item.ProductVariantId.Value, item.Quantity.Value);
                    if (!success)
                    {
                        var variant = await _context.ProductVariants
                            .Include(v => v.Product)
                            .FirstOrDefaultAsync(v => v.Id == item.ProductVariantId.Value);

                        throw new InvalidOperationException($"Sản phẩm '{variant?.Product?.Name}' không đủ tồn kho để đặt hàng.");
                    }
                }

                // 4. Lưu lại
                await _context.SaveChangesAsync();

                // 5. Commit Transaction
                await transaction.CommitAsync();

                return order;
            }
            catch (Exception)
            {
                // Rollback nếu có lỗi (kể cả từ business logic ném ra)
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<Order> CreateGuestOrderAsync(Order order, List<OrderItem> items)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                order.Items = items;
                await _context.Orders.AddAsync(order);

                foreach (var item in items)
                {
                    if (item.ProductVariantId == null || item.Quantity == null)
                        throw new InvalidOperationException("Dữ liệu sản phẩm không hợp lệ.");

                    bool success = await DeductStockSafelyAsync(item.ProductVariantId.Value, item.Quantity.Value);
                    if (!success)
                    {
                        var variant = await _context.ProductVariants
                            .Include(v => v.Product)
                            .FirstOrDefaultAsync(v => v.Id == item.ProductVariantId.Value);

                        throw new InvalidOperationException($"Sản phẩm '{variant?.Product?.Name}' không đủ tồn kho để đặt hàng.");
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return order;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<bool> DeductStockSafelyAsync(Guid variantId, int quantity)
        {
            // Câu lệnh chặn bán vượt kho cực kỳ an toàn
            int affectedRows = await _context.Database.ExecuteSqlRawAsync(
                @"UPDATE product_variants 
                  SET stock = stock - {0} 
                  WHERE id = {1} AND stock >= {0}",
                quantity, variantId);

            return affectedRows > 0;
        }

        public async Task<Order?> GetOrderBasicAsync(Guid orderId)
        {
            return await _context.Orders.FindAsync(orderId);
        }

        public async Task UpdateOrderAsync(Order order)
        {
            _context.Orders.Update(order);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<Order>> GetAllOrdersAsync(int page, int pageSize, string? status)
        {
            var query = _context.Orders
                .Include(o => o.User)
                .Include(o => o.Items)
                .OrderByDescending(o => o.CreatedAt)
                .AsQueryable();

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(o => o.Status == status);
            }

            return await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<int> GetTotalOrdersCountAsync(string? status)
        {
            var query = _context.Orders.AsQueryable();
            
            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(o => o.Status == status);
            }
            
            return await query.CountAsync();
        }

        public async Task RestoreStockAsync(Guid orderId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var orderItems = await _context.OrderItems
                    .Where(x => x.OrderId == orderId)
                    .ToListAsync();

                foreach (var item in orderItems)
                {
                    await _context.Database.ExecuteSqlRawAsync(
                        "UPDATE product_variants SET stock = stock + {0} WHERE id = {1}",
                        item.Quantity ?? 0, item.ProductVariantId);
                }
                
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<IEnumerable<Order>> GetPendingExpiredOrdersAsync(DateTime thresholdTime)
        {
            return await _context.Orders
                .Where(o => o.Status == "Pending" && o.CreatedAt <= thresholdTime)
                .ToListAsync();
        }

        public async Task<AdminStatsDto> GetAdminStatsAsync()
        {
            var orders = await _context.Orders
                .Include(o => o.User)
                .Include(o => o.Address)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            var totalRevenue = orders
                .Where(o => o.Status == "Delivered")
                .Sum(o => o.TotalPrice ?? 0);

            var recentOrders = orders.Take(8).Select(o => new RecentOrderDto
            {
                Id           = o.Id,
                OrderNumber  = o.OrderNumber ?? "",
                CustomerName = o.User?.FullName ?? o.GuestFullName,
                TotalPrice   = o.TotalPrice,
                Status       = o.Status,
                CreatedAt    = o.CreatedAt
            }).ToList();

            var totalUsers    = await _context.Users.CountAsync();
            var totalProducts = await _context.Products.CountAsync();
            var totalReviews  = await _context.Reviews.CountAsync();
            var totalVouchers = await _context.Vouchers.CountAsync();

            return new AdminStatsDto
            {
                TotalRevenue      = totalRevenue,
                TotalOrders       = orders.Count,
                PendingOrders     = orders.Count(o => o.Status == "Pending"),
                ProcessingOrders  = orders.Count(o => o.Status == "Processing"),
                ShippedOrders     = orders.Count(o => o.Status == "Shipped"),
                DeliveredOrders   = orders.Count(o => o.Status == "Delivered"),
                CancelledOrders   = orders.Count(o => o.Status == "Cancelled" || o.Status == "CancelRequested"),
                TotalUsers        = totalUsers,
                TotalProducts     = totalProducts,
                TotalReviews      = totalReviews,
                TotalVouchers     = totalVouchers,
                RecentOrders      = recentOrders
            };
        }
    }
}
