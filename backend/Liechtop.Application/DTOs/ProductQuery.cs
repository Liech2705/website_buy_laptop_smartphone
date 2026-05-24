namespace Liechtop.Application.DTOs
{
    public class ProductQuery
    {
        /// <summary>Tìm theo tên sản phẩm (case-insensitive contains)</summary>
        public string? Search { get; set; }

        /// <summary>Lọc theo danh mục</summary>
        public Guid? CategoryId { get; set; }

        /// <summary>Lọc theo thương hiệu</summary>
        public Guid? BrandId { get; set; }

        /// <summary>Giá tối thiểu (base_price)</summary>
        public decimal? MinPrice { get; set; }

        /// <summary>Giá tối đa (base_price)</summary>
        public decimal? MaxPrice { get; set; }

        /// <summary>Chỉ lấy sản phẩm còn hàng (có variant với stock > 0)</summary>
        public bool? InStock { get; set; }

        /// <summary>Sắp xếp: price_asc | price_desc | newest</summary>
        public string? Sort { get; set; }

        /// <summary>Trang hiện tại (bắt đầu từ 1)</summary>
        public int Page { get; set; } = 1;

        /// <summary>Số item mỗi trang (mặc định 10, tối đa 50)</summary>
        private int _pageSize = 10;
        public int PageSize
        {
            get => _pageSize;
            set => _pageSize = value > 50 ? 50 : value < 1 ? 1 : value;
        }
    }
}
