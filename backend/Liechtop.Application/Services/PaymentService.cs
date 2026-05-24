using Liechtop.Application.DTOs;
using Liechtop.Application.Interfaces;
using Liechtop.Application.Utils;
using Liechtop.Domain.Entities;
using Microsoft.Extensions.Configuration;

namespace Liechtop.Application.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly IOrderRepository _orderRepo;
        private readonly IPaymentRepository _paymentRepo;
        private readonly IConfiguration _config;

        public PaymentService(
            IOrderRepository orderRepo, 
            IPaymentRepository paymentRepo, 
            IConfiguration config)
        {
            _orderRepo = orderRepo;
            _paymentRepo = paymentRepo;
            _config = config;
        }

        public async Task<PaymentUrlResponseDto> CreateVNPayUrlAsync(Guid userId, CreatePaymentDto dto, string ipAddress)
        {
            // Use basic fetch — GetOrderWithDetailsAsync filters by userId which can fail
            // for guest orders that were later linked to a user account
            var order = await _orderRepo.GetOrderBasicAsync(dto.OrderId);
            
            if (order == null)
                throw new InvalidOperationException("Không tìm thấy đơn hàng.");

            // Verify ownership: order must belong to this user
            if (order.UserId.HasValue && order.UserId.Value != userId)
                throw new InvalidOperationException("Bạn không có quyền thanh toán đơn hàng này.");

            if (order.Status != "Pending" && order.Status != "Awaiting Payment")
                throw new InvalidOperationException("Đơn hàng đã được thanh toán hoặc không hợp lệ.");

            // Lấy Configuration cho VNPay
            string vnp_TmnCode = _config["Vnpay:TmnCode"] ?? "";
            string vnp_HashSecret = _config["Vnpay:HashSecret"] ?? "";
            string vnp_Url = _config["Vnpay:BaseUrl"] ?? "";
            string vnp_ReturnUrl = _config["Vnpay:ReturnUrl"] ?? "";

            var vnpay = new VnPayLibrary();
            var orderIdStr = order.Id.ToString();
            var amountStr = ((long)((order.TotalPrice ?? 0) * 100)).ToString(); 
            var createDate = DateTime.Now.ToString("yyyyMMddHHmmss");

            vnpay.AddRequestData("vnp_Version", "2.1.0");
            vnpay.AddRequestData("vnp_Command", "pay");
            vnpay.AddRequestData("vnp_TmnCode", vnp_TmnCode);
            vnpay.AddRequestData("vnp_Amount", amountStr);
            vnpay.AddRequestData("vnp_CreateDate", createDate);
            vnpay.AddRequestData("vnp_CurrCode", "VND");
            vnpay.AddRequestData("vnp_IpAddr", ipAddress);
            vnpay.AddRequestData("vnp_Locale", "vn");
            vnpay.AddRequestData("vnp_OrderInfo", "Thanh toan don hang: " + orderIdStr);
            vnpay.AddRequestData("vnp_OrderType", "other");
            vnpay.AddRequestData("vnp_ReturnUrl", vnp_ReturnUrl);
            vnpay.AddRequestData("vnp_TxnRef", orderIdStr); 
            // Có thể thêm ExpireDate vnp_ExpireDate nếu cần
            
            string paymentUrl = vnpay.CreateRequestUrl(vnp_Url, vnp_HashSecret);

            // Update order status loosely
            order.Status = "Awaiting Payment";
            await _orderRepo.UpdateOrderAsync(order);

            return new PaymentUrlResponseDto
            {
                OrderId = orderIdStr,
                PaymentUrl = paymentUrl
            };
        }

        public async Task<bool> ProcessVnpayIpnAsync(VnpayIpnRequest request)
        {
            if (string.IsNullOrEmpty(request.vnp_TxnRef) || string.IsNullOrEmpty(request.vnp_SecureHash))
            {
                return false;
            }

            string vnp_HashSecret = _config["Vnpay:HashSecret"] ?? "";

            var vnpay = new VnPayLibrary();

            // Đưa toàn bộ request data vào vnpay_library để validate
            vnpay.AddResponseData("vnp_Amount", request.vnp_Amount ?? "");
            vnpay.AddResponseData("vnp_BankCode", request.vnp_BankCode ?? "");
            vnpay.AddResponseData("vnp_BankTranNo", request.vnp_BankTranNo ?? "");
            vnpay.AddResponseData("vnp_CardType", request.vnp_CardType ?? "");
            vnpay.AddResponseData("vnp_OrderInfo", request.vnp_OrderInfo ?? "");
            vnpay.AddResponseData("vnp_PayDate", request.vnp_PayDate ?? "");
            vnpay.AddResponseData("vnp_ResponseCode", request.vnp_ResponseCode ?? "");
            vnpay.AddResponseData("vnp_TmnCode", request.vnp_TmnCode ?? "");
            vnpay.AddResponseData("vnp_TransactionNo", request.vnp_TransactionNo ?? "");
            vnpay.AddResponseData("vnp_TransactionStatus", request.vnp_TransactionStatus ?? "");
            vnpay.AddResponseData("vnp_TxnRef", request.vnp_TxnRef ?? "");
            vnpay.AddResponseData("vnp_SecureHash", request.vnp_SecureHash ?? "");

            bool checkSignature = vnpay.ValidateSignature(request.vnp_SecureHash, vnp_HashSecret);

            if (!checkSignature)
            {
                return false;
            }

            if (!Guid.TryParse(request.vnp_TxnRef, out Guid orderId))
                return false;

            var order = await _orderRepo.GetOrderBasicAsync(orderId);
            if (order == null)
                return false;

            if (order.Status == "Paid")
            {
                // Đã xử lý IPN trước đó rồi
                return true;
            }

            if (request.vnp_ResponseCode == "00" && request.vnp_TransactionStatus == "00")
            {
                // Tiền thật đã vào tài khoản
                order.Status = "Paid";
                await _orderRepo.UpdateOrderAsync(order);

                var paymentLog = new Payment
                {
                    Id = Guid.NewGuid(),
                    OrderId = order.Id,
                    Method = "VNPay",
                    Status = "Success"
                };
                await _paymentRepo.AddPaymentAsync(paymentLog);

                return true;
            }
            else
            {
                // Thanh toán thất bại (User huỷ giao dịch, thẻ lỗi)
                order.Status = "Failed";
                await _orderRepo.UpdateOrderAsync(order);

                var paymentLog = new Payment
                {
                    Id = Guid.NewGuid(),
                    OrderId = order.Id,
                    Method = "VNPay",
                    Status = "Failed"
                };
                await _paymentRepo.AddPaymentAsync(paymentLog);

                return false;
            }
        }
    }
}
