using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Liechtop.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RebuildProductAttributeValues : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Drop the old table entirely (old schema: product_variant_id + attribute_value_id many-to-many)
            // and recreate with new schema: id, product_id, attribute_id, value
            migrationBuilder.Sql(@"DROP TABLE IF EXISTS product_attribute_values CASCADE;");

            migrationBuilder.CreateTable(
                name: "product_attribute_values",
                columns: table => new
                {
                    id           = table.Column<Guid>(type: "uuid", nullable: false),
                    product_id   = table.Column<Guid>(type: "uuid", nullable: false),
                    attribute_id = table.Column<Guid>(type: "uuid", nullable: false),
                    value        = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_product_attribute_values", x => x.id);
                    table.ForeignKey(
                        name: "FK_product_attribute_values_products_product_id",
                        column: x => x.product_id,
                        principalTable: "products",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_product_attribute_values_attributes_attribute_id",
                        column: x => x.attribute_id,
                        principalTable: "attributes",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_product_attribute_values_product_id",
                table: "product_attribute_values",
                column: "product_id");

            migrationBuilder.CreateIndex(
                name: "IX_product_attribute_values_attribute_id",
                table: "product_attribute_values",
                column: "attribute_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "product_attribute_values");
        }
    }
}
