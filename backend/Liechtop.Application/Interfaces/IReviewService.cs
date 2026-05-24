using Liechtop.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Liechtop.Application.Interfaces
{
    public interface IReviewService
    {
        Task<IEnumerable<ReviewDto>> GetAllAsync();
        Task<IEnumerable<ReviewDto>> GetByProductAsync(Guid productId);
        Task<ReviewDto> CreateAsync(Guid userId, CreateReviewDto dto);
        Task<bool> DeleteAsync(Guid id);
        Task<bool> CanUserReviewAsync(Guid userId, Guid productId);
    }
}
