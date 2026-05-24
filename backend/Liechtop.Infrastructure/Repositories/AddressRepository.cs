using Liechtop.Application.Interfaces;
using Liechtop.Domain.Entities;
using Liechtop.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Liechtop.Infrastructure.Repositories
{
    public class AddressRepository : IAddressRepository
    {
        private readonly AppDbContext _context;

        public AddressRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Address>> GetByUserIdAsync(Guid userId)
        {
            return await _context.Addresses
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.IsDefault)
                .ToListAsync();
        }

        public async Task<Address?> GetByIdAsync(Guid id)
        {
            return await _context.Addresses.FindAsync(id);
        }

        public async Task AddAsync(Address address)
        {
            _context.Addresses.Add(address);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Address address)
        {
            _context.Addresses.Update(address);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Address address)
        {
            _context.Addresses.Remove(address);
            await _context.SaveChangesAsync();
        }

        public async Task<List<Address>> GetDefaultsByUserIdAsync(Guid userId)
        {
            return await _context.Addresses
                .Where(a => a.UserId == userId && a.IsDefault)
                .ToListAsync();
        }
    }
}
