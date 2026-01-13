using Ecommerce.Domain.Entities;
using Ecommerce.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Ecommerce.Api.Controllers;

[ApiController]
[Route("orders")]
[Authorize]
public sealed class OrdersController : ControllerBase
{
    private readonly AppDbContext _db;
    public OrdersController(AppDbContext db) => _db = db;

    public sealed record CreateOrderItemRequest(Guid ProductId, int Quantity);

    public sealed record CreateOrderRequest(List<CreateOrderItemRequest> Items);

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateOrderRequest req)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdStr, out var userId))
            return Unauthorized();

        if (req.Items is null || req.Items.Count == 0)
            return BadRequest(new { message = "Cart is empty." });

        var items = req.Items
            .Where(x => x.Quantity > 0)
            .GroupBy(x => x.ProductId)
            .Select(g => new { ProductId = g.Key, Quantity = g.Sum(x => x.Quantity) })
            .ToList();

        if (items.Count == 0)
            return BadRequest(new { message = "Cart is empty." });

        var productIds = items.Select(x => x.ProductId).ToList();

        var products = await _db.Products.AsNoTracking()
            .Where(p => productIds.Contains(p.Id) && p.IsActive)
            .ToListAsync();

        if (products.Count != productIds.Count)
            return BadRequest(new { message = "One or more products are invalid." });

        var order = new Order
        {
            UserId = userId,
            CreatedAtUtc = DateTime.UtcNow
        };

        foreach (var it in items)
        {
            var p = products.First(x => x.Id == it.ProductId);

            order.Items.Add(new OrderItem
            {
                ProductId = p.Id,
                ProductName = p.Name,
                UnitPriceCents = p.PriceCents,
                Quantity = it.Quantity
            });
        }

        order.TotalCents = order.Items.Sum(x => x.UnitPriceCents * x.Quantity);

        _db.Orders.Add(order);
        await _db.SaveChangesAsync();

        return Ok(new
        {
            orderId = order.Id,
            totalCents = order.TotalCents,
            createdAtUtc = order.CreatedAtUtc
        });
    }

    [HttpGet("my")]
    public async Task<IActionResult> MyOrders()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdStr, out var userId))
            return Unauthorized();

        var orders = await _db.Orders.AsNoTracking()
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAtUtc)
            .Select(o => new
            {
                o.Id,
                o.TotalCents,
                o.CreatedAtUtc,
                itemCount = o.Items.Count
            })
            .ToListAsync();

        return Ok(orders);
    }
}