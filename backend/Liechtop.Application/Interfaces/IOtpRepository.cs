using Liechtop.Domain.Entities;
using System.Threading.Tasks;

namespace Liechtop.Application.Interfaces
{
    public interface IOtpRepository
    {
        Task AddAsync(OtpLog otp);
        Task<OtpLog?> GetLatestValidOtpAsync(string email, string type);
        Task UpdateAsync(OtpLog otp);
    }
}
