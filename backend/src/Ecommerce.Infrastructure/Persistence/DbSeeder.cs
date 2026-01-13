using Ecommerce.Domain.Entities;

namespace Ecommerce.Infrastructure.Persistence;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        if (db.Categories.Any()) return;

        var puzzles = new Category { Name = "Puzzles", Slug = "puzzles" };
        var toys = new Category { Name = "Toys", Slug = "toys" };

        db.Categories.AddRange(puzzles, toys);

        db.Products.AddRange(
            new Product
            {
                Name = "Wooden Logic Puzzle", Description = "Classic brain teaser", PriceCents = 1999,
                Category = puzzles
            },
            new Product
            {
                Name = "Magnetic Tangram Set", Description = "Travel-friendly tangrams", PriceCents = 1499,
                Category = puzzles
            },
            new Product
            {
                Name = "Robot Toy Kit", Description = "Build a small robot", PriceCents = 4999, Category = toys
            }
        );

        await db.SaveChangesAsync();
    }
}