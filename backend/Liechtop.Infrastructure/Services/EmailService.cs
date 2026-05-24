using Liechtop.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using MailKit.Net.Smtp;
using MimeKit;
using System.Threading.Tasks;

namespace Liechtop.Infrastructure.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;

        public EmailService(IConfiguration config)
        {
            _config = config;
        }

        public async Task SendEmailAsync(string to, string subject, string body)
        {
            var emailSettings = _config.GetSection("Email");
            
            var email = new MimeMessage();
            email.From.Add(new MailboxAddress(emailSettings["FromName"], emailSettings["FromEmail"]));
            email.To.Add(MailboxAddress.Parse(to));
            email.Subject = subject;

            var builder = new BodyBuilder { HtmlBody = body };
            email.Body = builder.ToMessageBody();

            using var smtp = new SmtpClient();
            await smtp.ConnectAsync(emailSettings["SmtpServer"], int.Parse(emailSettings["SmtpPort"] ?? "587"), MailKit.Security.SecureSocketOptions.StartTls);
            await smtp.AuthenticateAsync(emailSettings["SmtpUser"], emailSettings["SmtpPass"]);
            await smtp.SendAsync(email);
            await smtp.DisconnectAsync(true);
        }

        public async Task SendOtpEmailAsync(string to, string otp)
        {
            string subject = "Mã OTP đặt lại mật khẩu - Liechtop Shop";
            string body = $@"
                <div style='font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;'>
                    <h2 style='color: #4F46E5; text-align: center;'>Đặt lại mật khẩu</h2>
                    <p>Chào bạn,</p>
                    <p>Bạn đã yêu cầu đặt lại mật khẩu tại <b>Liechtop Shop</b>. Vui lòng sử dụng mã OTP dưới đây để hoàn tất quá trình:</p>
                    <div style='background: #F3F4F6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #111827; border-radius: 8px; margin: 20px 0;'>
                        {otp}
                    </div>
                    <p style='color: #6B7280; font-size: 14px;'>Mã OTP này sẽ hết hạn sau 10 phút. Nếu bạn không yêu cầu hành động này, vui lòng bỏ qua email này.</p>
                    <hr style='border: none; border-top: 1px solid #eee; margin: 20px 0;' />
                    <p style='text-align: center; color: #9CA3AF; font-size: 12px;'>&copy; 2026 Liechtop Shop. All rights reserved.</p>
                </div>";

            await SendEmailAsync(to, subject, body);
        }

        public async Task SendVerifyEmailAsync(string to, string otp)
        {
            string subject = "Xác minh tài khoản - Liechtop Shop";
            string body = $@"
                <div style='font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;'>
                    <h2 style='color: #10B981; text-align: center;'>Xác minh tài khoản Liechtop</h2>
                    <p>Chào bạn,</p>
                    <p>Cảm ơn bạn đã đăng ký tài khoản tại <b>Liechtop Shop</b>! Để kích hoạt tài khoản, vui lòng nhập mã OTP dưới đây:</p>
                    <div style='background: #ECFDF5; padding: 20px; text-align: center; font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #065F46; border-radius: 8px; margin: 20px 0; border: 2px dashed #10B981;'>
                        {otp}
                    </div>
                    <p style='color: #6B7280; font-size: 14px;'>Mã xác minh này sẽ hết hạn sau <b>10 phút</b>. Nếu bạn không thực hiện đăng ký, vui lòng bỏ qua email này.</p>
                    <hr style='border: none; border-top: 1px solid #eee; margin: 20px 0;' />
                    <p style='text-align: center; color: #9CA3AF; font-size: 12px;'>&copy; 2026 Liechtop Shop. All rights reserved.</p>
                </div>";

            await SendEmailAsync(to, subject, body);
        }
    }
}
