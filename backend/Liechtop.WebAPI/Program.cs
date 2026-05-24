using System.Text;
using Liechtop.Application.Interfaces;
using Liechtop.Application.Services;
using Liechtop.Infrastructure.Data;
using Liechtop.Infrastructure.Repositories;
using Liechtop.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Liechtop.Domain.Entities;

var builder = WebApplication.CreateBuilder(args);

// ─── CORS ──────────────────────────────────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173",
                "http://localhost:5174",
                "http://localhost:3000"
              )
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// ─── Database ─────────────────────────────────────────────────────
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// ─── DI — Repositories ────────────────────────────────────────────
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<IUserRepository,   UserRepository>();
builder.Services.AddScoped<IRoleRepository,   RoleRepository>();
builder.Services.AddScoped<ICartRepository,   CartRepository>();
builder.Services.AddScoped<IOrderRepository,  OrderRepository>();
builder.Services.AddScoped<IPaymentRepository,PaymentRepository>();
builder.Services.AddScoped<ICategoryRepository,CategoryRepository>();
builder.Services.AddScoped<IAddressRepository, AddressRepository>();
builder.Services.AddScoped<IVoucherRepository, VoucherRepository>();
builder.Services.AddScoped<IReviewRepository, ReviewRepository>();
builder.Services.AddScoped<IOtpRepository,   OtpRepository>();
builder.Services.AddScoped<IRefundRequestRepository, RefundRequestRepository>();

// ─── DI — Services ────────────────────────────────────────────────
builder.Services.AddHttpContextAccessor();

builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<IAuthService,    AuthService>();
builder.Services.AddScoped<IJwtService,     JwtService>();
builder.Services.AddScoped<ICartService,    CartService>();
builder.Services.AddScoped<IOrderService,   OrderService>();
builder.Services.AddScoped<IPaymentService, PaymentService>();
builder.Services.AddScoped<IUserService,    UserService>();
builder.Services.AddScoped<IAddressService, AddressService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IVoucherService,  VoucherService>();
builder.Services.AddScoped<IReviewService,   ReviewService>();
builder.Services.AddScoped<IEmailService,    EmailService>();

// ─── Background Jobs ──────────────────────────────────────────────
builder.Services.AddHostedService<Liechtop.WebAPI.BackgroundJobs.AutoCancelOrderService>();

// ─── JWT Authentication ───────────────────────────────────────────
var jwtConfig  = builder.Configuration.GetSection("Jwt");
var secretKey  = jwtConfig["SecretKey"]!;
var issuer     = jwtConfig["Issuer"]!;
var audience   = jwtConfig["Audience"]!;

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme    = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer           = true,
        ValidateAudience         = true,
        ValidateLifetime         = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer              = issuer,
        ValidAudience            = audience,
        IssuerSigningKey         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
        ClockSkew                = TimeSpan.Zero   // không cho phép trễ giờ
    };
});

builder.Services.AddAuthorization();

// ─── Controllers ──────────────────────────────────────────────────
builder.Services.AddControllers();

// ─── Swagger với Bearer token support ─────────────────────────────
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Liechtop API", Version = "v1" });

    // Thêm nút Authorize trong Swagger UI
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name         = "Authorization",
        Type         = SecuritySchemeType.Http,
        Scheme       = "Bearer",
        BearerFormat = "JWT",
        In           = ParameterLocation.Header,
        Description  = "Nhập JWT token. Ví dụ: Bearer eyJhbGci..."
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id   = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// ─── Build app ────────────────────────────────────────────────────
var app = builder.Build();

// ─── Data Seeding ─────────────────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    
    // Ensure roles exist
    if (!await context.Roles.AnyAsync(r => r.Name == "Owner"))
    {
        await context.Roles.AddAsync(new Role { Id = Guid.NewGuid(), Name = "Owner" });
    }
    if (!await context.Roles.AnyAsync(r => r.Name == "Admin"))
    {
        await context.Roles.AddAsync(new Role { Id = Guid.NewGuid(), Name = "Admin" });
    }
    if (!await context.Roles.AnyAsync(r => r.Name == "Customer"))
    {
        await context.Roles.AddAsync(new Role { Id = Guid.NewGuid(), Name = "Customer" });
    }
    await context.SaveChangesAsync();

    // Ensure Owner user exists and has Owner role (designated for admin@gmail.com)
    var ownerRole = await context.Roles.FirstAsync(r => r.Name == "Owner");
    var adminUser = await context.Users.FirstOrDefaultAsync(u => u.Email == "admin@gmail.com");
    if (adminUser != null && adminUser.RoleId != ownerRole.Id)
    {
        adminUser.RoleId = ownerRole.Id;
        await context.SaveChangesAsync();
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// ⚠️ Thứ tự PHẢI đúng: CORS → Authentication → Authorization
app.UseStaticFiles();
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
