using Liechtop.Application.DTOs;
using Liechtop.Application.Interfaces;
using Liechtop.Application.Utils;
using Liechtop.Domain.Entities;

namespace Liechtop.Application.Services
{
    public class OrderService : IOrderService
    {
        private readonly IOrderRepository _orderRepo;
        private readonly ICartRepository _cartRepo;
        private readonly IVoucherRepository _voucherRepo;
        private readonly IVoucherService _voucherService;
        private readonly IProductRepository _productRepo;
        private readonly IRefundRequestRepository _refundRequestRepo;

        public OrderService(IOrderRepository orderRepo, ICartRepository cartRepo, IVoucherRepository voucherRepo, IVoucherService voucherService, IProductRepository productRepo, IRefundRequestRepository refundRequestRepo)
        {
            _orderRepo = orderRepo;
            _cartRepo = cartRepo;
            _voucherRepo = voucherRepo;
            _voucherService = voucherService;
            _productRepo = productRepo;
            _refundRequestRepo = refundRequestRepo;
        }

        public async Task<OrderDto> CheckoutAsync(Guid userId, CreateOrderDto dto)
        {
            if (dto.Items == null || !dto.Items.Any())
                throw new InvalidOperationException("Giỏ hàng đang trống, không thể thanh toán.");

            Guid addressId;
            if (dto.ExistingAddressId.HasValue)
            {
                var existAddress = await _orderRepo.GetAddressByIdAsync(dto.ExistingAddressId.Value);
                if (existAddress == null || existAddress.UserId != userId)
                    throw new InvalidOperationException("Địa chỉ không hợp lệ.");
                addressId = existAddress.Id;
            }
            else if (dto.NewAddress != null)
            {
                addressId = Guid.NewGuid();
            }
            else
            {
                throw new InvalidOperationException("Bạn phải cung cấp địa chỉ giao hàng.");
            }

            var newOrderId = Guid.NewGuid();
            var orderItems = new List<OrderItem>();
            decimal totalPrice = 0;

            foreach (var item in dto.Items)
            {
                // SECURITY: Verify price from DB, don't trust the DTO!
                var variant = await _cartRepo.GetVariantByIdAsync(item.ProductVariantId);
                if (variant == null)
                    throw new InvalidOperationException("Biến thể sản phẩm không tồn tại.");

                totalPrice += (variant.Price * item.Quantity);

                orderItems.Add(new OrderItem
                {
                    Id = Guid.NewGuid(),
                    OrderId = newOrderId,
                    ProductVariantId = item.ProductVariantId,
                    Price = variant.Price,  
                    Quantity = item.Quantity
                });
            }

            string orderNumber = "ORD-" + DateTime.Now.ToString("yyyyMMdd") + "-" + new Random().Next(1000, 9999);

            decimal shipFee = dto.ShippingFee ?? 0;

            var order = new Order
            {
                Id = newOrderId,
                UserId = userId,
                TotalPrice = totalPrice + shipFee,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow,
                OrderNumber = orderNumber,
                PaymentMethod = dto.PaymentMethod,
                Note = dto.Note
            };

            if (dto.NewAddress != null)
            {
                order.Address = new Address
                {
                    Id = addressId,
                    UserId = userId,
                    FullName = dto.NewAddress.FullName,
                    Phone = dto.NewAddress.Phone,
                    Province = dto.NewAddress.Province,
                    District = dto.NewAddress.District,
                    Ward = dto.NewAddress.Ward,
                    DetailAddress = dto.NewAddress.DetailAddress
                };
            }
            else
            {
                order.AddressId = addressId;
            }

            // Voucher processing
            List<Voucher> appliedVouchers = new();
            if (dto.VoucherCodes != null && dto.VoucherCodes.Any())
            {
                decimal productDiscount = 0;
                decimal shippingDiscount = 0;
                List<string> appliedCodes = new();

                foreach (var code in dto.VoucherCodes)
                {
                    var voucher = await _voucherRepo.GetByCodeAsync(code.ToUpper().Trim());
                    if (voucher != null && voucher.IsActive)
                    {
                        var now = DateTime.UtcNow;
                        bool isValid = (!voucher.StartDate.HasValue || voucher.StartDate <= now) &&
                                       (!voucher.ExpiryDate.HasValue || voucher.ExpiryDate >= now) &&
                                       (!voucher.UsageLimit.HasValue || voucher.UsedCount < voucher.UsageLimit) &&
                                       (totalPrice >= voucher.MinOrderAmount); // Min order amount is checked against original total

                        if (isValid)
                        {
                            var codeUpper = voucher.Code.ToUpper();
                            var descLower = (voucher.Description ?? "").ToLower();
                            bool isFreeship = codeUpper.Contains("FS") || codeUpper.Contains("FREE") || codeUpper.Contains("SHIP") || 
                                              descLower.Contains("ship") || descLower.Contains("vận chuyển") || descLower.Contains("freeship");

                            decimal discount = 0;
                            if (isFreeship)
                            {
                                if (voucher.DiscountAmount.HasValue)
                                {
                                    discount = voucher.DiscountAmount.Value;
                                }
                                else if (voucher.DiscountPercentage.HasValue)
                                {
                                    discount = shipFee * (voucher.DiscountPercentage.Value / 100);
                                    if (voucher.MaxDiscountAmount.HasValue && discount > voucher.MaxDiscountAmount.Value)
                                        discount = voucher.MaxDiscountAmount.Value;
                                }
                                else
                                {
                                    discount = shipFee;
                                }
                                discount = Math.Min(discount, shipFee);
                                shippingDiscount += discount;
                            }
                            else
                            {
                                if (voucher.DiscountAmount.HasValue)
                                {
                                    discount = voucher.DiscountAmount.Value;
                                }
                                else if (voucher.DiscountPercentage.HasValue)
                                {
                                    discount = totalPrice * (voucher.DiscountPercentage.Value / 100);
                                    if (voucher.MaxDiscountAmount.HasValue && discount > voucher.MaxDiscountAmount.Value)
                                        discount = voucher.MaxDiscountAmount.Value;
                                }
                                discount = Math.Min(discount, totalPrice);
                                productDiscount += discount;
                            }

                            if (discount > 0)
                            {
                                appliedCodes.Add(voucher.Code);
                                appliedVouchers.Add(voucher);
                            }
                        }
                    }
                }

                decimal totalDiscount = productDiscount + shippingDiscount;
                if (totalDiscount > 0)
                {
                    order.DiscountAmount = totalDiscount;
                    order.AppliedVoucherCode = string.Join(",", appliedCodes);
                    order.TotalPrice = Math.Max(0, totalPrice - productDiscount + shipFee - shippingDiscount);
                }
            }

            // Get cart to clear if NOT buy now
            Cart? cartToClear = null;
            if (dto.Items.Count() > 1 || !dto.IsBuyNow) 
            {
                cartToClear = await _cartRepo.GetCartByUserIdAsync(userId);
            }

            var savedOrder = await _orderRepo.CreateOrderAsync(order, orderItems, cart: cartToClear);

            // Increment voucher usage count and mark in user wallet AFTER successful order
            foreach (var v in appliedVouchers)
            {
                v.UsedCount++;
                await _voucherRepo.UpdateAsync(v);
                await _voucherService.MarkVoucherUsedAsync(userId, v.Code);
            }

            var fullOrder = await _orderRepo.GetOrderWithDetailsAsync(userId, savedOrder.Id);
            return MapToDto(fullOrder!, orderNumber);
        }

        public async Task<OrderDto> GuestCheckoutAsync(GuestCreateOrderDto dto, Guid? userId = null)
        {
            if (dto.Items == null || !dto.Items.Any())
                throw new ArgumentException("Giỏ hàng trống, không thể đặt hàng.");

            var newOrderId = Guid.NewGuid();
            var orderItems = new List<OrderItem>();
            decimal totalPrice = 0;

            foreach (var item in dto.Items)
            {
                // Verify variant exists and get real price
                var variant = await _cartRepo.GetVariantByIdAsync(item.ProductVariantId);
                if (variant == null)
                    throw new InvalidOperationException("Sản phẩm không hợp lệ.");

                totalPrice += variant.Price * item.Quantity;
                orderItems.Add(new OrderItem
                {
                    Id               = Guid.NewGuid(),
                    OrderId          = newOrderId,
                    ProductVariantId = item.ProductVariantId,
                    Price            = variant.Price,
                    Quantity         = item.Quantity
                });
            }

            string orderNumber = "G-ORD-" + DateTime.Now.ToString("yyyyMMdd") + "-" + new Random().Next(1000, 9999);

            var order = new Order
            {
                Id            = newOrderId,
                UserId        = userId,
                TotalPrice    = totalPrice,
                Status        = "Pending",
                CreatedAt     = DateTime.UtcNow,
                GuestFullName = dto.FullName,
                GuestEmail    = dto.Email,
                GuestPhone    = dto.Phone,
                GuestAddress  = $"{dto.DetailAddress}, {dto.Ward}, {dto.District}, {dto.Province}",
                Note          = dto.Note,
                PaymentMethod = dto.PaymentMethod,
                OrderNumber   = orderNumber
            };

            var savedOrder = await _orderRepo.CreateGuestOrderAsync(order, orderItems);

            // Use internal helper to get details for guest order since it doesn't have a UserId
            var fullOrder = await _orderRepo.GetOrderWithDetailsForAdminAsync(savedOrder.Id);
            return MapToDto(fullOrder!, orderNumber);
        }

        public async Task<List<OrderDto>> GetMyOrdersAsync(Guid userId)
        {
            var orders = await _orderRepo.GetOrdersByUserIdAsync(userId);
            return orders.Select(o => MapToDto(o)).ToList();
        }

        public async Task<OrderDto> GetMyOrderDetailsAsync(Guid userId, Guid orderId)
        {
            var order = await _orderRepo.GetOrderWithDetailsAsync(userId, orderId);
            if (order == null) throw new KeyNotFoundException("Đơn hàng không tồn tại hoặc không phải của bạn.");
            return MapToDto(order);
        }

        public async Task<(IEnumerable<OrderDto> Orders, int TotalCount)> GetAllOrdersAsync(int page, int pageSize, string? status)
        {
            var total = await _orderRepo.GetTotalOrdersCountAsync(status);
            var orders = await _orderRepo.GetAllOrdersAsync(page, pageSize, status);
            return (orders.Select(o => MapToDto(o)).ToList(), total);
        }

        public async Task<bool> AdminUpdateOrderStatusAsync(Guid orderId, UpdateTrackingDto dto)
        {
            var order = await _orderRepo.GetOrderBasicAsync(orderId);
            if (order == null) throw new KeyNotFoundException("Order not found");

            string paymentMethod = (order.PaymentMethod ?? "COD").ToUpper(); 

            if (!OrderStateMachine.IsValidTransition(order.Status ?? "Pending", dto.Status, paymentMethod))
                throw new InvalidOperationException($"Không thể chuyển trạng thái từ {order.Status} sang {dto.Status} (PTTT: {paymentMethod})");

            var now = DateTime.UtcNow;
            if (order.Status == "CancelRequested" && dto.Status == "Processing")
            {
                var refundRequest = await _refundRequestRepo.GetRefundRequestByOrderIdAsync(orderId);
                if (refundRequest != null)
                {
                    refundRequest.Status = "Rejected";
                    refundRequest.ProcessedAt = now;
                    await _refundRequestRepo.UpdateRefundRequestAsync(refundRequest);
                }
            }

            order.Status = dto.Status;

            switch(dto.Status)
            {
                case "Shipped":
                    order.ShippedAt = now;
                    order.TrackingCode = dto.TrackingCode;
                    order.ShippingProvider = dto.ShippingProvider;
                    break;
                case "Delivered":
                    order.DeliveredAt = now;
                    break;
                case "Cancelled":
                    order.CancelledAt = now;
                    break;
            }

            await _orderRepo.UpdateOrderAsync(order);
            return true;
        }

        public async Task<bool> AdminConfirmCancelAndRestockAsync(Guid orderId)
        {
            var order = await _orderRepo.GetOrderBasicAsync(orderId);
            if (order == null) throw new KeyNotFoundException("Order not found");

            if (order.Status != "Cancelled" && order.Status != "CancelRequested")
                throw new InvalidOperationException("Đơn hàng chưa được đánh dấu Hủy.");

            order.Status = "Restocked";
            order.CancelledAt ??= DateTime.UtcNow;

            await _orderRepo.UpdateOrderAsync(order);
            await _orderRepo.RestoreStockAsync(orderId);
            return true;
        }

        public async Task<bool> UserCancelOrderAsync(Guid userId, Guid orderId, CancelOrderRequestDto? dto)
        {
            var order = await _orderRepo.GetOrderWithDetailsAsync(userId, orderId);
            if (order == null) 
                throw new KeyNotFoundException("Order not found");

            string paymentMethod = (order.PaymentMethod ?? "COD").ToUpper(); 
            bool isPaid = order.PaidAt.HasValue || order.Status == "Paid" || order.Status == "Processing";

            if (!OrderStateMachine.IsValidTransition(order.Status ?? "Pending", "CancelRequested", paymentMethod))
                throw new InvalidOperationException("Đơn hàng không ở trạng thái hợp lệ để yêu cầu hủy.");

            order.Status = "CancelRequested";

            if (isPaid)
            {
                if (dto == null || string.IsNullOrWhiteSpace(dto.BankName) || string.IsNullOrWhiteSpace(dto.AccountNumber) || string.IsNullOrWhiteSpace(dto.AccountName))
                {
                    throw new InvalidOperationException("Đơn hàng đã thanh toán. Vui lòng cung cấp đầy đủ thông tin tài khoản ngân hàng để hoàn tiền.");
                }
                
                var refundRequest = new RefundRequest
                {
                    Id = Guid.NewGuid(),
                    OrderId = order.Id,
                    BankName = dto.BankName.Trim(),
                    AccountNumber = dto.AccountNumber.Trim(),
                    AccountName = dto.AccountName.Trim().ToUpper(),
                    Amount = order.TotalPrice ?? 0,
                    Reason = dto.Reason?.Trim(),
                    Status = "Pending",
                    CreatedAt = DateTime.UtcNow
                };

                await _refundRequestRepo.AddRefundRequestAsync(refundRequest);
            }
            else
            {
                var refundRequest = new RefundRequest
                {
                    Id = Guid.NewGuid(),
                    OrderId = order.Id,
                    BankName = "COD (Không hoàn tiền)",
                    AccountNumber = "N/A",
                    AccountName = "N/A",
                    Amount = 0,
                    Reason = dto?.Reason?.Trim(),
                    Status = "Pending",
                    CreatedAt = DateTime.UtcNow
                };

                await _refundRequestRepo.AddRefundRequestAsync(refundRequest);
            }

            await _orderRepo.UpdateOrderAsync(order);
            return true;
        }

        public async Task<bool> AdminConfirmRefundAsync(Guid orderId)
        {
            var order = await _orderRepo.GetOrderWithDetailsForAdminAsync(orderId);
            if (order == null)
                throw new KeyNotFoundException("Không tìm thấy đơn hàng.");

            if (order.Status != "CancelRequested")
                throw new InvalidOperationException("Đơn hàng không có yêu cầu hủy/hoàn tiền.");

            string paymentMethod = (order.PaymentMethod ?? "COD").ToUpper();

            if (!OrderStateMachine.IsValidTransition(order.Status, "Restocked", paymentMethod))
                throw new InvalidOperationException("Trạng thái chuyển đổi không hợp lệ.");

            order.Status = "Restocked";
            order.CancelledAt = DateTime.UtcNow;

            var refundRequest = await _refundRequestRepo.GetRefundRequestByOrderIdAsync(orderId);
            if (refundRequest != null)
            {
                refundRequest.Status = "Approved";
                refundRequest.ProcessedAt = DateTime.UtcNow;
                await _refundRequestRepo.UpdateRefundRequestAsync(refundRequest);
            }

            if (order.Payment != null)
            {
                order.Payment.Status = "Refunded";
            }

            // Restore stocks
            await _orderRepo.RestoreStockAsync(orderId);

            // Restore vouchers
            if (order.UserId.HasValue && !string.IsNullOrEmpty(order.AppliedVoucherCode))
            {
                var codes = order.AppliedVoucherCode.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
                foreach (var c in codes)
                {
                    await _voucherService.RestoreVoucherAsync(order.UserId.Value, c);
                }
            }

            await _orderRepo.UpdateOrderAsync(order);
            return true;
        }

        private OrderDto MapToDto(Order order, string orderNumberFallback = "")
        {
            string shippingAddr = "";
            if (!string.IsNullOrEmpty(order.GuestAddress))
            {
                shippingAddr = order.GuestAddress;
            }
            else if (order.Address != null)
            {
                var a = order.Address;
                shippingAddr = $"{a.DetailAddress}, {a.Ward}, {a.District}, {a.Province}";
            }

            return new OrderDto
            {
                Id             = order.Id,
                OrderNumber    = order.OrderNumber ?? orderNumberFallback,
                TotalPrice     = order.TotalPrice ?? 0,
                Status         = order.Status ?? "Pending",
                CreatedAt      = order.CreatedAt ?? DateTime.UtcNow,

                ShippingAddress= shippingAddr,
                FullName       = order.GuestFullName ?? order.Address?.FullName ?? order.User?.FullName,
                Email          = order.GuestEmail    ?? order.User?.Email,
                Phone          = order.GuestPhone    ?? order.Address?.Phone,

                PaidAt         = order.PaidAt,
                ShippedAt      = order.ShippedAt,
                DeliveredAt    = order.DeliveredAt,
                CancelledAt    = order.CancelledAt,
                TrackingCode   = order.TrackingCode,
                ShippingProvider = order.ShippingProvider,
                DiscountAmount = order.DiscountAmount,
                AppliedVoucherCode = order.AppliedVoucherCode,

                Items = order.Items.Select(i => new OrderItemDto
                {
                    Id               = i.Id,
                    ProductVariantId = i.ProductVariantId ?? Guid.Empty,
                    ProductId        = i.ProductVariant?.ProductId,
                    ProductName      = i.ProductVariant?.Product?.Name ?? "Unknown",
                    ImageUrl         = i.ProductVariant?.Product?.Images?.FirstOrDefault()?.ImageUrl ?? "",
                    PriceAtPurchase  = i.Price ?? 0,
                    Quantity         = i.Quantity ?? 0
                }).ToList(),
                RefundRequest = order.RefundRequest != null ? new RefundRequestDto
                {
                    Id = order.RefundRequest.Id,
                    OrderId = order.RefundRequest.OrderId,
                    BankName = order.RefundRequest.BankName,
                    AccountNumber = order.RefundRequest.AccountNumber,
                    AccountName = order.RefundRequest.AccountName,
                    Amount = order.RefundRequest.Amount,
                    Reason = order.RefundRequest.Reason,
                    Status = order.RefundRequest.Status,
                    CreatedAt = order.RefundRequest.CreatedAt,
                    ProcessedAt = order.RefundRequest.ProcessedAt
                } : null
            };
        }

        public async Task<AdminStatsDto> GetAdminStatsAsync()
        {
            return await _orderRepo.GetAdminStatsAsync();
        }

        public async Task<OrderDto> GetAdminOrderDetailsAsync(Guid orderId)
        {
            var order = await _orderRepo.GetOrderWithDetailsForAdminAsync(orderId);
            if (order == null) throw new KeyNotFoundException("Đơn hàng không tồn tại.");
            return MapToDto(order);
        }
    }
}
