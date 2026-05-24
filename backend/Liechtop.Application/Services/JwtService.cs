using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Liechtop.Application.Interfaces;
using Liechtop.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Liechtop.Application.Services
{
    public class JwtService : IJwtService
    {
        private readonly IConfiguration _config;

        public JwtService(IConfiguration config)
        {
            _config = config;
        }

        public string GenerateToken(User user, string roleName)
        {
            var jwtConfig    = _config.GetSection("Jwt");
            var secretKey    = jwtConfig["SecretKey"]!;
            var issuer       = jwtConfig["Issuer"]!;
            var audience     = jwtConfig["Audience"]!;
            var expiryDays   = int.Parse(jwtConfig["ExpiryDays"] ?? "7");

            var key   = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // Payload: userId + email + role
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub,   user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(JwtRegisteredClaimNames.Jti,   Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.NameIdentifier,     user.Id.ToString()),
                new Claim(ClaimTypes.Email,              user.Email),
                new Claim(ClaimTypes.Role,               roleName)
            };

            var token = new JwtSecurityToken(
                issuer:             issuer,
                audience:           audience,
                claims:             claims,
                expires:            DateTime.UtcNow.AddDays(expiryDays),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
