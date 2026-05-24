using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Liechtop.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddGuestOrderFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "TrackingCode",
                table: "orders",
                newName: "tracking_code");

            migrationBuilder.RenameColumn(
                name: "ShippingProvider",
                table: "orders",
                newName: "shipping_provider");

            migrationBuilder.RenameColumn(
                name: "ShippedAt",
                table: "orders",
                newName: "shipped_at");

            migrationBuilder.RenameColumn(
                name: "PaidAt",
                table: "orders",
                newName: "paid_at");

            migrationBuilder.RenameColumn(
                name: "DeliveredAt",
                table: "orders",
                newName: "delivered_at");

            migrationBuilder.RenameColumn(
                name: "CancelledAt",
                table: "orders",
                newName: "cancelled_at");

            migrationBuilder.AddColumn<string>(
                name: "guest_address",
                table: "orders",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "guest_email",
                table: "orders",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "guest_full_name",
                table: "orders",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "guest_phone",
                table: "orders",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "note",
                table: "orders",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "order_number",
                table: "orders",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "payment_method",
                table: "orders",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "guest_address",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "guest_email",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "guest_full_name",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "guest_phone",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "note",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "order_number",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "payment_method",
                table: "orders");

            migrationBuilder.RenameColumn(
                name: "tracking_code",
                table: "orders",
                newName: "TrackingCode");

            migrationBuilder.RenameColumn(
                name: "shipping_provider",
                table: "orders",
                newName: "ShippingProvider");

            migrationBuilder.RenameColumn(
                name: "shipped_at",
                table: "orders",
                newName: "ShippedAt");

            migrationBuilder.RenameColumn(
                name: "paid_at",
                table: "orders",
                newName: "PaidAt");

            migrationBuilder.RenameColumn(
                name: "delivered_at",
                table: "orders",
                newName: "DeliveredAt");

            migrationBuilder.RenameColumn(
                name: "cancelled_at",
                table: "orders",
                newName: "CancelledAt");
        }
    }
}
