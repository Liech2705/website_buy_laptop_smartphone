using Liechtop.Application.Interfaces;
using Liechtop.Domain.Entities;
using Liechtop.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Liechtop.Infrastructure.Repositories
{
    public class RoleRepository : IRoleRepository
    {
        private readonly AppDbContext _context;

        public RoleRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Role?> GetByNameAsync(string name)
            => await _context.Roles.FirstOrDefaultAsync(r => r.Name == name);
    }
}
