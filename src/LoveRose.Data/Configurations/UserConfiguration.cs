using LoveRose.Core.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LoveRose.Data.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("AspNetUsers"); // Usar la tabla por defecto de Identity

        // Configuración de propiedades
        builder.Property(u => u.FirstName)
            .IsRequired()
            .HasMaxLength(50);
            
        builder.Property(u => u.LastName)
            .IsRequired()
            .HasMaxLength(50);
            
        builder.Property(u => u.DateOfBirth)
            .IsRequired();
            
        builder.Property(u => u.ProfileImageUrl)
            .HasMaxLength(500);
            
        builder.Property(u => u.IsActive)
            .HasDefaultValue(true);
            
        builder.Property(u => u.CreatedAt)
            .HasDefaultValueSql("CURRENT_TIMESTAMP");
            
        // Configuración de índices
        builder.HasIndex(u => u.Email)
            .IsUnique();
            
        builder.HasIndex(u => u.NormalizedEmail)
            .IsUnique();
            
        builder.HasIndex(u => u.UserName)
            .IsUnique();
            
        builder.HasIndex(u => u.NormalizedUserName)
            .IsUnique();
    }
}
