using Ecommerce.Domain.Entities;
using Ecommerce.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Api.Controllers;

[ApiController]
[Route("admin/products")]
[Authorize(Roles = "Admin")]
public sealed class AdminProductsController : ControllerBase
{
    private readonly AppDbContext _db;
    public AdminProductsController(AppDbContext db) => _db = db;

    public sealed record UpsertProductRequest(
        string Name,
        string? Description,
        int PriceCents,
        string? ImageUrl,
        string? CategorySlug,
        bool IsActive
    );

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] UpsertProductRequest req)
    {
        var category = await ResolveCategory(req.CategorySlug);
        if (category is null)
            return BadRequest(new { message = "Invalid categorySlug." });

        var p = new Product
        {
            Id = Guid.NewGuid(),
            Name = req.Name.Trim(),
            Description = req.Description,
            PriceCents = req.PriceCents,
            ImageUrl = req.ImageUrl,
            IsActive = req.IsActive,
            CategoryId = category.Id
        };

        _db.Products.Add(p);
        await _db.SaveChangesAsync();
        return Ok(new { p.Id });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpsertProductRequest req)
    {
        var p = await _db.Products.FirstOrDefaultAsync(x => x.Id == id);
        if (p is null) return NotFound();

        var category = await ResolveCategory(req.CategorySlug);
        if (category is null)
            return BadRequest(new { message = "Invalid categorySlug." });

        p.Name = req.Name.Trim();
        p.Description = req.Description;
        p.PriceCents = req.PriceCents;
        p.ImageUrl = req.ImageUrl;
        p.IsActive = req.IsActive;
        p.CategoryId = category.Id;

        await _db.SaveChangesAsync();
        return Ok();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var p = await _db.Products.FirstOrDefaultAsync(x => x.Id == id);
        if (p is null) return NotFound();

        _db.Products.Remove(p);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private async Task<Category?> ResolveCategory(string? slug)
    {
        if (string.IsNullOrWhiteSpace(slug)) return null;

        var s = slug.Trim().ToLower();
        return await _db.Categories.FirstOrDefaultAsync(c => c.Slug == s);
    }
}