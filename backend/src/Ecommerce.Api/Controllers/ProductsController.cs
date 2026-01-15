using Ecommerce.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Api.Controllers;

[ApiController]
[Route("products")]
public sealed class ProductsController : ControllerBase
{
    private readonly AppDbContext _db;
    public ProductsController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetMany(
        [FromQuery] string? search,
        [FromQuery] string? category,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 12)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = _db.Products.AsNoTracking()
            .Include(p => p.Category)
            .Where(p => p.IsActive);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(p => p.Name.ToLower().Contains(s));
        }

        if (!string.IsNullOrWhiteSpace(category))
        {
            var c = category.Trim().ToLower();
            query = query.Where(p => p.Category != null && p.Category.Slug == c);
        }

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderBy(p => p.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new
            {
                p.Id,
                p.Name,
                p.Description,
                p.PriceCents,
                p.ImageUrl,
                Category = p.Category == null
                    ? null
                    : new
                    {
                        p.Category.Id,
                        p.Category.Name,
                        p.Category.Slug
                    }
            })
            .ToListAsync();

        return Ok(new { totalCount, page, pageSize, items });
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetOne(Guid id)
    {
        var p = await _db.Products.AsNoTracking()
            .Include(x => x.Category)
            .Where(x => x.IsActive && x.Id == id)
            .Select(x => new
            {
                x.Id,
                x.Name,
                x.Description,
                x.PriceCents,
                x.ImageUrl,
                Category = x.Category == null ? null : new { x.Category.Id, x.Category.Name, x.Category.Slug }
            })
            .FirstOrDefaultAsync();

        return p is null ? NotFound() : Ok(p);
    }
}