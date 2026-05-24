using Liechtop.Application.DTOs;

namespace Liechtop.Application.Interfaces
{
    public interface IAddressService
    {
        Task<List<UserAddressDto>> GetUserAddressesAsync(Guid userId);
        Task<UserAddressDto> GetAddressByIdAsync(Guid id);
        Task<UserAddressDto> CreateAddressAsync(Guid userId, CreateAddressDto dto);
        Task<UserAddressDto> UpdateAddressAsync(Guid id, Guid userId, CreateAddressDto dto);
        Task DeleteAddressAsync(Guid id, Guid userId);
        Task SetDefaultAddressAsync(Guid id, Guid userId);
    }
}
