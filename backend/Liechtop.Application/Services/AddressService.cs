using Liechtop.Application.DTOs;
using Liechtop.Application.Interfaces;
using Liechtop.Domain.Entities;

namespace Liechtop.Application.Services
{
    public class AddressService : IAddressService
    {
        private readonly IAddressRepository _addressRepo;

        public AddressService(IAddressRepository addressRepo)
        {
            _addressRepo = addressRepo;
        }

        public async Task<List<UserAddressDto>> GetUserAddressesAsync(Guid userId)
        {
            var addresses = await _addressRepo.GetByUserIdAsync(userId);
            return addresses.Select(a => new UserAddressDto
            {
                Id = a.Id,
                FullName = a.FullName ?? "",
                Phone = a.Phone ?? "",
                Province = a.Province ?? "",
                District = a.District ?? "",
                Ward = a.Ward ?? "",
                DetailAddress = a.DetailAddress ?? "",
                IsDefault = a.IsDefault
            }).ToList();
        }

        public async Task<UserAddressDto> GetAddressByIdAsync(Guid id)
        {
            var a = await _addressRepo.GetByIdAsync(id);
            if (a == null) throw new KeyNotFoundException("Address not found.");

            return new UserAddressDto
            {
                Id = a.Id,
                FullName = a.FullName ?? "",
                Phone = a.Phone ?? "",
                Province = a.Province ?? "",
                District = a.District ?? "",
                Ward = a.Ward ?? "",
                DetailAddress = a.DetailAddress ?? "",
                IsDefault = a.IsDefault
            };
        }

        public async Task<UserAddressDto> CreateAddressAsync(Guid userId, CreateAddressDto dto)
        {
            if (dto.IsDefault)
            {
                await ClearDefaultAddressAsync(userId);
            }

            var address = new Address
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                FullName = dto.FullName,
                Phone = dto.Phone,
                Province = dto.Province,
                District = dto.District,
                Ward = dto.Ward,
                DetailAddress = dto.DetailAddress,
                IsDefault = dto.IsDefault
            };

            await _addressRepo.AddAsync(address);
            return await GetAddressByIdAsync(address.Id);
        }

        public async Task<UserAddressDto> UpdateAddressAsync(Guid id, Guid userId, CreateAddressDto dto)
        {
            var a = await _addressRepo.GetByIdAsync(id);
            if (a == null || a.UserId != userId) throw new KeyNotFoundException("Address not found.");

            if (dto.IsDefault && !a.IsDefault)
            {
                await ClearDefaultAddressAsync(userId);
            }

            a.FullName = dto.FullName;
            a.Phone = dto.Phone;
            a.Province = dto.Province;
            a.District = dto.District;
            a.Ward = dto.Ward;
            a.DetailAddress = dto.DetailAddress;
            a.IsDefault = dto.IsDefault;

            await _addressRepo.UpdateAsync(a);
            return await GetAddressByIdAsync(id);
        }

        public async Task DeleteAddressAsync(Guid id, Guid userId)
        {
            var a = await _addressRepo.GetByIdAsync(id);
            if (a != null && a.UserId == userId)
            {
                await _addressRepo.DeleteAsync(a);
            }
        }

        public async Task SetDefaultAddressAsync(Guid id, Guid userId)
        {
            var a = await _addressRepo.GetByIdAsync(id);
            if (a == null || a.UserId != userId) throw new KeyNotFoundException("Address not found.");

            await ClearDefaultAddressAsync(userId);
            a.IsDefault = true;
            await _addressRepo.UpdateAsync(a);
        }

        private async Task ClearDefaultAddressAsync(Guid userId)
        {
            var defaults = await _addressRepo.GetDefaultsByUserIdAsync(userId);
            foreach (var d in defaults)
            {
                d.IsDefault = false;
                await _addressRepo.UpdateAsync(d);
            }
        }
    }
}
