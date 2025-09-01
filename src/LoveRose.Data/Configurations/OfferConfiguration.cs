using LoveRose.Core.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LoveRose.Data.Configurations;

public class OfferConfiguration : IEntityTypeConfiguration<Offer>
{
    public void Configure(EntityTypeBuilder<Offer> builder)
    {
        builder.HasKey(o => o.Id);
        
        builder.Property(o => o.OfferAmount)
            .HasColumnType("decimal(18,2)")
            .IsRequired();
            
        builder.Property(o => o.Status)
            .IsRequired()
            .HasConversion<string>();
            
        builder.Property(o => o.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("NOW()");
            
        // Configuración de relaciones
        builder.HasOne(o => o.User)
            .WithMany(u => u.Offers)
            .HasForeignKey(o => o.UserId)
            .OnDelete(DeleteBehavior.Restrict);
            
        builder.HasOne(o => o.Product)
            .WithMany(p => p.Offers)
            .HasForeignKey(o => o.ProductId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
