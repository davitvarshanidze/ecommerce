namespace Ecommerce.Domain.Entities;

public sealed class OrderItem
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid OrderId { get; set; }
    public Order? Order { get; set; }

    public Guid ProductId { get; set; }
    public Product? Product { get; set; }

    public required string ProductName { get; set; }
    public int UnitPriceCents { get; set; }
    public int Quantity { get; set; }
}