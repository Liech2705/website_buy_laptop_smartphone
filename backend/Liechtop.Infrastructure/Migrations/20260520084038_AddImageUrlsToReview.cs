using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Liechtop.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddImageUrlsToReview : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "image_urls",
                table: "reviews",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "image_urls",
                table: "reviews");
        }
    }
}
