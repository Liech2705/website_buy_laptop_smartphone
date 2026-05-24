namespace Liechtop.Domain.Entities
{
    public class Category
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public Guid? ParentId { get; set; }

        public Category? Parent { get; set; }
        public List<Category> Children { get; set; } = new();
        public List<Product> Products { get; set; } = new();
    }
}
