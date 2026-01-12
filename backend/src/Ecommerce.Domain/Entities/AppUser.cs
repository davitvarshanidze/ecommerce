namespace Ecommerce.Domain.Entities;

public sealed class AppUser
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public required string Email { get; set; }

    // store a hashed password only
    public required string PasswordHash { get; set; }

    // simple role for now: "User" or "Admin"
    public required string Role { get; set; } = "User";

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}