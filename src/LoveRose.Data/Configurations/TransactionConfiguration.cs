using LoveRose.Core.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LoveRose.Data.Configurations;

public class TransactionConfiguration : IEntityTypeConfiguration<Transaction>
{
    public void Configure(EntityTypeBuilder<Transaction> builder)
    {
        builder.ToTable("transactions");
        
        // Configuración de la clave primaria
        builder.HasKey(t => t.Id);
        
        // Configuración de propiedades
        builder.Property(t => t.Type)
            .IsRequired()
            .HasMaxLength(50);
            
        builder.Property(t => t.Amount)
            .IsRequired()
            .HasColumnType("numeric(18,2)");
            
        builder.Property(t => t.Currency)
            .IsRequired()
            .HasMaxLength(10)
            .HasDefaultValue("USD");
            
        builder.Property(t => t.Description)
            .HasMaxLength(500);
            
        builder.Property(t => t.Status)
            .IsRequired()
            .HasMaxLength(50)
            .HasDefaultValue("pending");
            
        builder.Property(t => t.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("CURRENT_TIMESTAMP");
            
        // Configuración de índices
        builder.HasIndex(t => t.UserId);
        builder.HasIndex(t => t.CreatedAt);
        builder.HasIndex(t => t.Status);
        
        // Configuración de la relación con User
        builder.HasOne(t => t.User)
            .WithMany(u => u.Transactions)
            .HasForeignKey(t => t.UserId)
            .IsRequired()
            .OnDelete(DeleteBehavior.Restrict);
    }
}
