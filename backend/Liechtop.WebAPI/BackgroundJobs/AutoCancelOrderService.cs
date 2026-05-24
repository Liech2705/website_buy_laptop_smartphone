using Liechtop.Application.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Liechtop.WebAPI.BackgroundJobs
{
    public class AutoCancelOrderService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<AutoCancelOrderService> _logger;

        public AutoCancelOrderService(IServiceProvider serviceProvider, ILogger<AutoCancelOrderService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Job AutoCancelOrderService Started.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    // Run every 1 minute
                    await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);

                    using var scope = _serviceProvider.CreateScope();
                    var orderRepo = scope.ServiceProvider.GetRequiredService<IOrderRepository>();

                    // Threshold = 15 phút trước
                    var thresholdTime = DateTime.UtcNow.AddMinutes(-15);

                    // We need to fetch all pending orders older than 15 minutes.
                    var pendingOrders = await orderRepo.GetPendingExpiredOrdersAsync(thresholdTime);

                    foreach (var order in pendingOrders)
                    {
                        order.Status = "Cancelled";
                        order.CancelledAt = DateTime.UtcNow;
                        await orderRepo.UpdateOrderAsync(order);
                        
                        await orderRepo.RestoreStockAsync(order.Id);

                        _logger.LogInformation("Auto-cancelled Order {OrderId} due to expiration.", order.Id);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred executing AutoCancelOrderService.");
                }
            }
        }
    }
}
