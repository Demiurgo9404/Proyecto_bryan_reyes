using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Proyecto.Core.Entities;
using Proyecto.Infrastructure.Identity;

namespace Proyecto.Infrastructure.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    // Add your DbSet properties here
    public DbSet<ModelProfile> ModelProfiles { get; set; }
    public DbSet<Content> Contents { get; set; }
    public DbSet<Message> Messages { get; set; }
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<Transaction> Transactions { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        
        // Customize the ASP.NET Identity model and override the defaults if needed
        builder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
        
        // Example of configuring a relationship
        builder.Entity<ModelProfile>(entity =>
        {
            entity.HasOne(m => m.User)
                .WithOne()
                .HasForeignKey<ModelProfile>(m => m.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
