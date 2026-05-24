using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Liechtop.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddIsEmailVerifiedToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsEmailVerified",
                table: "users",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            // Set Admin account as verified (admin should never be locked out)
            migrationBuilder.Sql(@"
                UPDATE users
                SET ""IsEmailVerified"" = true
                WHERE id IN (
                    SELECT u.id FROM users u
                    INNER JOIN roles r ON u.role_id = r.id
                    WHERE r.name = 'Admin'
                )
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsEmailVerified",
                table: "users");
        }
    }
}
