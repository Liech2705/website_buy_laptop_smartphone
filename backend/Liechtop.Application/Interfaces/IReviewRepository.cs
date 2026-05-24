using Liechtop.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Liechtop.Application.Interfaces
{
    public interface IReviewRepository
    {
        Task<IEnumerable<Review>> GetAllAsync();
        Task<IEnumerable<Review>> GetByProductIdAsync(Guid productId);
        Task<Review?> GetByIdAsync(Guid id);
        Task AddAsync(Review review);
        Task DeleteAsync(Review review);
        Task<bool> HasUserPurchasedProductAsync(Guid userId, Guid productId);
        Task<bool> HasUserReviewedProductAsync(Guid userId, Guid productId);
    }
}
