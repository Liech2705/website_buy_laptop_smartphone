using Liechtop.Application.DTOs;
using Liechtop.Application.Interfaces;
using Liechtop.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Liechtop.Application.Services
{
    public class ReviewService : IReviewService
    {
        private readonly IReviewRepository _reviewRepo;

        public ReviewService(IReviewRepository reviewRepo)
        {
            _reviewRepo = reviewRepo;
        }

        public async Task<IEnumerable<ReviewDto>> GetAllAsync()
        {
            var reviews = await _reviewRepo.GetAllAsync();
            return reviews.Select(MapToDto);
        }

        public async Task<IEnumerable<ReviewDto>> GetByProductAsync(Guid productId)
        {
            var reviews = await _reviewRepo.GetByProductIdAsync(productId);
            return reviews.Select(MapToDto);
        }

        public async Task<ReviewDto> CreateAsync(Guid userId, CreateReviewDto dto)
        {
            var hasPurchased = await _reviewRepo.HasUserPurchasedProductAsync(userId, dto.ProductId);
            if (!hasPurchased)
            {
                throw new InvalidOperationException("Bạn chỉ được đánh giá sản phẩm sau khi đã mua hàng thành công.");
            }

            var review = new Review
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                ProductId = dto.ProductId,
                Rating = dto.Rating,
                Comment = dto.Comment,
                ImageUrls = dto.ImageUrls != null && dto.ImageUrls.Count > 0 ? string.Join(",", dto.ImageUrls) : null,
                CreatedAt = DateTime.UtcNow
            };

            await _reviewRepo.AddAsync(review);
            return MapToDto(review);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var review = await _reviewRepo.GetByIdAsync(id);
            if (review == null) return false;
            await _reviewRepo.DeleteAsync(review);
            return true;
        }

        public async Task<bool> CanUserReviewAsync(Guid userId, Guid productId)
        {
            var hasPurchased = await _reviewRepo.HasUserPurchasedProductAsync(userId, productId);
            if (!hasPurchased) return false;

            var hasReviewed = await _reviewRepo.HasUserReviewedProductAsync(userId, productId);
            return !hasReviewed;
        }

        private ReviewDto MapToDto(Review r) => new ReviewDto
        {
            Id = r.Id,
            UserId = r.UserId,
            UserName = r.User?.FullName,
            ProductId = r.ProductId,
            ProductName = r.Product?.Name,
            ProductImage = r.Product?.Images?.FirstOrDefault()?.ImageUrl,
            Rating = r.Rating ?? 0,
            Comment = r.Comment,
            ImageUrls = string.IsNullOrEmpty(r.ImageUrls)
                ? new List<string>()
                : r.ImageUrls.Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries).ToList(),
            CreatedAt = r.CreatedAt
        };
    }
}
