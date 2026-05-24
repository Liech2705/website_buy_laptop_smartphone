using Microsoft.EntityFrameworkCore;
using Liechtop.Domain.Entities;

namespace Liechtop.Infrastructure.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // ─── DbSets ────────────────────────────────────────────────────
        public DbSet<Role> Roles { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Brand> Brands { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<ProductVariant> ProductVariants { get; set; }
        public DbSet<ProductAttribute> Attributes { get; set; }
        public DbSet<AttributeValue> AttributeValues { get; set; }
        public DbSet<ProductAttributeValue> ProductAttributeValues { get; set; }
        public DbSet<ProductImage> ProductImages { get; set; }
        public DbSet<Address> Addresses { get; set; }
        public DbSet<Cart> Carts { get; set; }
        public DbSet<CartItem> CartItems { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<Voucher> Vouchers { get; set; }
        public DbSet<UserVoucher> UserVouchers { get; set; }
        public DbSet<OtpLog> OtpLogs { get; set; }
        public DbSet<RefundRequest> RefundRequests { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ─── Map table names to snake_case (Supabase convention) ───
            modelBuilder.Entity<Role>().ToTable("roles");
            modelBuilder.Entity<User>().ToTable("users");
            modelBuilder.Entity<Category>().ToTable("categories");
            modelBuilder.Entity<Brand>().ToTable("brands");
            modelBuilder.Entity<Product>().ToTable("products");
            modelBuilder.Entity<ProductVariant>().ToTable("product_variants");
            modelBuilder.Entity<ProductAttribute>().ToTable("attributes");
            modelBuilder.Entity<AttributeValue>().ToTable("attribute_values");
            modelBuilder.Entity<ProductImage>().ToTable("product_images");
            modelBuilder.Entity<Address>().ToTable("addresses");
            modelBuilder.Entity<Cart>().ToTable("carts");
            modelBuilder.Entity<CartItem>().ToTable("cart_items");
            modelBuilder.Entity<Order>().ToTable("orders");
            modelBuilder.Entity<OrderItem>().ToTable("order_items");
            modelBuilder.Entity<Payment>().ToTable("payments");
            modelBuilder.Entity<Review>().ToTable("reviews");
            modelBuilder.Entity<Voucher>().ToTable("vouchers");
            modelBuilder.Entity<UserVoucher>().ToTable("user_vouchers");

            // ─── ProductAttributeValue — product-level attribute values ──
            modelBuilder.Entity<ProductAttributeValue>()
                .ToTable("product_attribute_values")
                .HasKey(x => x.Id);

            modelBuilder.Entity<ProductAttributeValue>()
                .Property(x => x.Id).HasColumnName("id");
            modelBuilder.Entity<ProductAttributeValue>()
                .Property(x => x.ProductId).HasColumnName("product_id");
            modelBuilder.Entity<ProductAttributeValue>()
                .Property(x => x.AttributeId).HasColumnName("attribute_id");
            modelBuilder.Entity<ProductAttributeValue>()
                .Property(x => x.Value).HasColumnName("value");

            modelBuilder.Entity<ProductAttributeValue>()
                .HasOne(av => av.Product)
                .WithMany(p => p.AttributeValues)
                .HasForeignKey(av => av.ProductId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ProductAttributeValue>()
                .HasOne(av => av.ProductAttribute)
                .WithMany()
                .HasForeignKey(av => av.AttributeId)
                .OnDelete(DeleteBehavior.Cascade);

            // ─── Map column names to snake_case ───────────────────────

            // Role
            modelBuilder.Entity<Role>().Property(x => x.Id).HasColumnName("id");
            modelBuilder.Entity<Role>().Property(x => x.Name).HasColumnName("name");

            // User
            modelBuilder.Entity<User>().Property(x => x.Id).HasColumnName("id");
            modelBuilder.Entity<User>().Property(x => x.Email).HasColumnName("email");
            modelBuilder.Entity<User>().Property(x => x.PasswordHash).HasColumnName("password_hash");
            modelBuilder.Entity<User>().Property(x => x.FullName).HasColumnName("full_name");
            modelBuilder.Entity<User>().Property(x => x.Phone).HasColumnName("phone");
            modelBuilder.Entity<User>().Property(x => x.Gender).HasColumnName("gender");
            modelBuilder.Entity<User>().Property(x => x.DateOfBirth).HasColumnName("date_of_birth");
            modelBuilder.Entity<User>().Property(x => x.RoleId).HasColumnName("role_id");
            modelBuilder.Entity<User>().Property(x => x.CreatedAt).HasColumnName("created_at");

            // Category
            modelBuilder.Entity<Category>().Property(x => x.Id).HasColumnName("id");
            modelBuilder.Entity<Category>().Property(x => x.Name).HasColumnName("name");
            modelBuilder.Entity<Category>().Property(x => x.ParentId).HasColumnName("parent_id");
            modelBuilder.Entity<Category>()
                .HasOne(c => c.Parent)
                .WithMany(c => c.Children)
                .HasForeignKey(c => c.ParentId);

            // Brand
            modelBuilder.Entity<Brand>().Property(x => x.Id).HasColumnName("id");
            modelBuilder.Entity<Brand>().Property(x => x.Name).HasColumnName("name");

            // Product
            modelBuilder.Entity<Product>().Property(x => x.Id).HasColumnName("id");
            modelBuilder.Entity<Product>().Property(x => x.Name).HasColumnName("name");
            modelBuilder.Entity<Product>().Property(x => x.Description).HasColumnName("description");
            modelBuilder.Entity<Product>().Property(x => x.BasePrice).HasColumnName("base_price");
            modelBuilder.Entity<Product>().Property(x => x.BrandId).HasColumnName("brand_id");
            modelBuilder.Entity<Product>().Property(x => x.CategoryId).HasColumnName("category_id");

            // ProductVariant
            modelBuilder.Entity<ProductVariant>().Property(x => x.Id).HasColumnName("id");
            modelBuilder.Entity<ProductVariant>().Property(x => x.ProductId).HasColumnName("product_id");
            modelBuilder.Entity<ProductVariant>().Property(x => x.Sku).HasColumnName("sku");
            modelBuilder.Entity<ProductVariant>().Property(x => x.Price).HasColumnName("price");
            modelBuilder.Entity<ProductVariant>().Property(x => x.Stock).HasColumnName("stock");

            // ProductAttribute
            modelBuilder.Entity<ProductAttribute>().Property(x => x.Id).HasColumnName("id");
            modelBuilder.Entity<ProductAttribute>().Property(x => x.Name).HasColumnName("name");

            // AttributeValue
            modelBuilder.Entity<AttributeValue>().Property(x => x.Id).HasColumnName("id");
            modelBuilder.Entity<AttributeValue>().Property(x => x.AttributeId).HasColumnName("attribute_id");
            modelBuilder.Entity<AttributeValue>().Property(x => x.Value).HasColumnName("value");

            // ProductImage
            modelBuilder.Entity<ProductImage>().Property(x => x.Id).HasColumnName("id");
            modelBuilder.Entity<ProductImage>().Property(x => x.ProductId).HasColumnName("product_id");
            modelBuilder.Entity<ProductImage>().Property(x => x.ImageUrl).HasColumnName("image_url");

            // Address
            modelBuilder.Entity<Address>().Property(x => x.Id).HasColumnName("id");
            modelBuilder.Entity<Address>().Property(x => x.UserId).HasColumnName("user_id");
            modelBuilder.Entity<Address>().Property(x => x.FullName).HasColumnName("full_name");
            modelBuilder.Entity<Address>().Property(x => x.Phone).HasColumnName("phone");
            modelBuilder.Entity<Address>().Property(x => x.Province).HasColumnName("province");
            modelBuilder.Entity<Address>().Property(x => x.District).HasColumnName("district");
            modelBuilder.Entity<Address>().Property(x => x.Ward).HasColumnName("ward");
            modelBuilder.Entity<Address>().Property(x => x.DetailAddress).HasColumnName("detail_address");
            modelBuilder.Entity<Address>().Property(x => x.IsDefault).HasColumnName("is_default");

            // Cart
            modelBuilder.Entity<Cart>().Property(x => x.Id).HasColumnName("id");
            modelBuilder.Entity<Cart>().Property(x => x.UserId).HasColumnName("user_id");

            // CartItem
            modelBuilder.Entity<CartItem>().Property(x => x.Id).HasColumnName("id");
            modelBuilder.Entity<CartItem>().Property(x => x.CartId).HasColumnName("cart_id");
            modelBuilder.Entity<CartItem>().Property(x => x.ProductVariantId).HasColumnName("product_variant_id");
            modelBuilder.Entity<CartItem>().Property(x => x.Quantity).HasColumnName("quantity");

            // Order
            modelBuilder.Entity<Order>().Property(x => x.Id).HasColumnName("id");
            modelBuilder.Entity<Order>().Property(x => x.UserId).HasColumnName("user_id");
            modelBuilder.Entity<Order>().Property(x => x.AddressId).HasColumnName("address_id");
            modelBuilder.Entity<Order>().Property(x => x.TotalPrice).HasColumnName("total_price");
            modelBuilder.Entity<Order>().Property(x => x.Status).HasColumnName("status");
            modelBuilder.Entity<Order>().Property(x => x.CreatedAt).HasColumnName("created_at");
            modelBuilder.Entity<Order>().Property(x => x.GuestFullName).HasColumnName("guest_full_name");
            modelBuilder.Entity<Order>().Property(x => x.GuestEmail).HasColumnName("guest_email");
            modelBuilder.Entity<Order>().Property(x => x.GuestPhone).HasColumnName("guest_phone");
            modelBuilder.Entity<Order>().Property(x => x.GuestAddress).HasColumnName("guest_address");
            modelBuilder.Entity<Order>().Property(x => x.Note).HasColumnName("note");
            modelBuilder.Entity<Order>().Property(x => x.PaymentMethod).HasColumnName("payment_method");
            modelBuilder.Entity<Order>().Property(x => x.OrderNumber).HasColumnName("order_number");
            modelBuilder.Entity<Order>().Property(x => x.PaidAt).HasColumnName("paid_at");
            modelBuilder.Entity<Order>().Property(x => x.ShippedAt).HasColumnName("shipped_at");
            modelBuilder.Entity<Order>().Property(x => x.DeliveredAt).HasColumnName("delivered_at");
            modelBuilder.Entity<Order>().Property(x => x.CancelledAt).HasColumnName("cancelled_at");
            modelBuilder.Entity<Order>().Property(x => x.TrackingCode).HasColumnName("tracking_code");
            modelBuilder.Entity<Order>().Property(x => x.ShippingProvider).HasColumnName("shipping_provider");
            modelBuilder.Entity<Order>().Property(x => x.DiscountAmount).HasColumnName("discount_amount");
            modelBuilder.Entity<Order>().Property(x => x.AppliedVoucherCode).HasColumnName("applied_voucher_code");

            // OrderItem
            modelBuilder.Entity<OrderItem>().Property(x => x.Id).HasColumnName("id");
            modelBuilder.Entity<OrderItem>().Property(x => x.OrderId).HasColumnName("order_id");
            modelBuilder.Entity<OrderItem>().Property(x => x.ProductVariantId).HasColumnName("product_variant_id");
            modelBuilder.Entity<OrderItem>().Property(x => x.Price).HasColumnName("price");
            modelBuilder.Entity<OrderItem>().Property(x => x.Quantity).HasColumnName("quantity");

            // Payment
            modelBuilder.Entity<Payment>().Property(x => x.Id).HasColumnName("id");
            modelBuilder.Entity<Payment>().Property(x => x.OrderId).HasColumnName("order_id");
            modelBuilder.Entity<Payment>().Property(x => x.Method).HasColumnName("method");
            modelBuilder.Entity<Payment>().Property(x => x.Status).HasColumnName("status");

            // RefundRequest
            modelBuilder.Entity<RefundRequest>().ToTable("refund_requests");
            modelBuilder.Entity<RefundRequest>().Property(x => x.Id).HasColumnName("id");
            modelBuilder.Entity<RefundRequest>().Property(x => x.OrderId).HasColumnName("order_id");
            modelBuilder.Entity<RefundRequest>().Property(x => x.BankName).HasColumnName("bank_name");
            modelBuilder.Entity<RefundRequest>().Property(x => x.AccountNumber).HasColumnName("account_number");
            modelBuilder.Entity<RefundRequest>().Property(x => x.AccountName).HasColumnName("account_name");
            modelBuilder.Entity<RefundRequest>().Property(x => x.Amount).HasColumnName("amount");
            modelBuilder.Entity<RefundRequest>().Property(x => x.Reason).HasColumnName("reason");
            modelBuilder.Entity<RefundRequest>().Property(x => x.Status).HasColumnName("status");
            modelBuilder.Entity<RefundRequest>().Property(x => x.CreatedAt).HasColumnName("created_at");
            modelBuilder.Entity<RefundRequest>().Property(x => x.ProcessedAt).HasColumnName("processed_at");

            modelBuilder.Entity<RefundRequest>()
                .HasOne(r => r.Order)
                .WithOne(o => o.RefundRequest)
                .HasForeignKey<RefundRequest>(r => r.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            // Review
            modelBuilder.Entity<Review>().Property(x => x.Id).HasColumnName("id");
            modelBuilder.Entity<Review>().Property(x => x.UserId).HasColumnName("user_id");
            modelBuilder.Entity<Review>().Property(x => x.ProductId).HasColumnName("product_id");
            modelBuilder.Entity<Review>().Property(x => x.Rating).HasColumnName("rating");
            modelBuilder.Entity<Review>().Property(x => x.Comment).HasColumnName("comment");
            modelBuilder.Entity<Review>().Property(x => x.ImageUrls).HasColumnName("image_urls");
            modelBuilder.Entity<Review>().Property(x => x.CreatedAt).HasColumnName("created_at");
            
            // Voucher
            modelBuilder.Entity<Voucher>().Property(x => x.Id).HasColumnName("id");
            modelBuilder.Entity<Voucher>().Property(x => x.Code).HasColumnName("code");
            modelBuilder.Entity<Voucher>().Property(x => x.Description).HasColumnName("description");
            modelBuilder.Entity<Voucher>().Property(x => x.DiscountAmount).HasColumnName("discount_amount");
            modelBuilder.Entity<Voucher>().Property(x => x.DiscountPercentage).HasColumnName("discount_percentage");
            modelBuilder.Entity<Voucher>().Property(x => x.MaxDiscountAmount).HasColumnName("max_discount_amount");
            modelBuilder.Entity<Voucher>().Property(x => x.MinOrderAmount).HasColumnName("min_order_amount");
            modelBuilder.Entity<Voucher>().Property(x => x.StartDate).HasColumnName("start_date");
            modelBuilder.Entity<Voucher>().Property(x => x.ExpiryDate).HasColumnName("expiry_date");
            modelBuilder.Entity<Voucher>().Property(x => x.UsageLimit).HasColumnName("usage_limit");
            modelBuilder.Entity<Voucher>().Property(x => x.UsageLimitPerUser).HasColumnName("usage_limit_per_user");
            modelBuilder.Entity<Voucher>().Property(x => x.UsedCount).HasColumnName("used_count");
            modelBuilder.Entity<Voucher>().Property(x => x.IsActive).HasColumnName("is_active");
            modelBuilder.Entity<Voucher>().Property(x => x.CreatedAt).HasColumnName("created_at");

            // UserVoucher
            modelBuilder.Entity<UserVoucher>().Property(x => x.Id).HasColumnName("id");
            modelBuilder.Entity<UserVoucher>().Property(x => x.UserId).HasColumnName("user_id");
            modelBuilder.Entity<UserVoucher>().Property(x => x.VoucherId).HasColumnName("voucher_id");
            modelBuilder.Entity<UserVoucher>().Property(x => x.IsUsed).HasColumnName("is_used");
            modelBuilder.Entity<UserVoucher>().Property(x => x.UsedAt).HasColumnName("used_at");
            modelBuilder.Entity<UserVoucher>().Property(x => x.SavedAt).HasColumnName("saved_at");

            modelBuilder.Entity<UserVoucher>()
                .HasOne(uv => uv.User)
                .WithMany()
                .HasForeignKey(uv => uv.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<UserVoucher>()
                .HasOne(uv => uv.Voucher)
                .WithMany()
                .HasForeignKey(uv => uv.VoucherId)
                .OnDelete(DeleteBehavior.Cascade);

            // Prevent duplicate saves: one user can save each voucher once
            modelBuilder.Entity<UserVoucher>()
                .HasIndex(uv => new { uv.UserId, uv.VoucherId })
                .IsUnique();

            // ─── Global UTC DateTime Converter ──────────────────────────
            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                foreach (var property in entityType.GetProperties())
                {
                    if (property.ClrType == typeof(DateTime))
                    {
                        property.SetValueConverter(new Microsoft.EntityFrameworkCore.Storage.ValueConversion.ValueConverter<DateTime, DateTime>(
                            v => v.Kind == DateTimeKind.Unspecified ? DateTime.SpecifyKind(v, DateTimeKind.Utc) : v,
                            v => v.Kind == DateTimeKind.Unspecified ? DateTime.SpecifyKind(v, DateTimeKind.Utc) : v
                        ));
                    }
                    else if (property.ClrType == typeof(DateTime?))
                    {
                        property.SetValueConverter(new Microsoft.EntityFrameworkCore.Storage.ValueConversion.ValueConverter<DateTime?, DateTime?>(
                            v => v.HasValue && v.Value.Kind == DateTimeKind.Unspecified ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : v,
                            v => v.HasValue && v.Value.Kind == DateTimeKind.Unspecified ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : v
                        ));
                    }
                }
            }
        }
    }
}
