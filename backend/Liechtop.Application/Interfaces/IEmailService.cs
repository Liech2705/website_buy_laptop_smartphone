using System.Threading.Tasks;

namespace Liechtop.Application.Interfaces
{
    public interface IEmailService
    {
        Task SendEmailAsync(string to, string subject, string body);
        Task SendOtpEmailAsync(string to, string otp);
        Task SendVerifyEmailAsync(string to, string otp);
    }
}
