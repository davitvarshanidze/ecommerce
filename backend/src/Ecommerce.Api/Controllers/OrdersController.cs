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

    public sealed record CreateOrderRequest(
        List<CreateOrderItemRequest> Items,
        string? PaymentMethod,
        string? CardBrand,
        string? CardLast4
    );

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

        var paymentMethod = string.IsNullOrWhiteSpace(req.PaymentMethod)
            ? "Mock"
            : req.PaymentMethod.Trim();

        // Only allow a small set of values (mock payments only)
        if (paymentMethod != "Card" && paymentMethod != "Cash" && paymentMethod != "Mock")
            return BadRequest(new { message = "Invalid paymentMethod." });

        string? cardBrand = null;
        string? cardLast4 = null;

        if (paymentMethod == "Card")
        {
            cardBrand = string.IsNullOrWhiteSpace(req.CardBrand) ? null : req.CardBrand.Trim();

            var last4 = string.IsNullOrWhiteSpace(req.CardLast4) ? null : req.CardLast4.Trim();
            if (last4 is not null)
            {
                // keep only digits and require exactly 4
                last4 = new string(last4.Where(char.IsDigit).ToArray());
                if (last4.Length != 4)
                    return BadRequest(new { message = "cardLast4 must be exactly 4 digits." });
            }

            cardLast4 = last4;
        }

        var productIds = items.Select(x => x.ProductId).ToList();

        var products = await _db.Products.AsNoTracking()
            .Where(p => productIds.Contains(p.Id) && p.IsActive)
            .ToListAsync();

        if (products.Count != productIds.Count)
            return BadRequest(new { message = "One or more products are invalid." });

        var order = new Order
        {
            UserId = userId,
            CreatedAtUtc = DateTime.UtcNow,
            PaymentMethod = paymentMethod,
            CardBrand = cardBrand,
            CardLast4 = cardLast4
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
            createdAtUtc = order.CreatedAtUtc,
            paymentMethod = order.PaymentMethod,
            cardBrand = order.CardBrand,
            cardLast4 = order.CardLast4
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

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetOne(Guid id)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdStr, out var userId))
            return Unauthorized();

        var order = await _db.Orders.AsNoTracking()
            .Where(o => o.Id == id && o.UserId == userId)
            .Select(o => new
            {
                o.Id,
                o.TotalCents,
                o.CreatedAtUtc,
                o.PaymentMethod,
                o.CardBrand,
                o.CardLast4,
                Items = o.Items
                    .OrderBy(i => i.ProductName)
                    .Select(i => new
                    {
                        i.ProductId,
                        i.ProductName,
                        i.UnitPriceCents,
                        i.Quantity
                    })
                    .ToList()
            })
            .FirstOrDefaultAsync();

        return order is null ? NotFound() : Ok(order);
    }
}