using LoveRose.Core.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LoveRose.Data.Configurations;

public class RoleConfiguration : IEntityTypeConfiguration<Role>
{
    public void Configure(EntityTypeBuilder<Role> builder)
    {
        builder.ToTable("AspNetRoles"); // Usar la tabla por defecto de Identity

        // Configuración de propiedades
        builder.Property(r => r.Description)
            .HasMaxLength(250);
            
        // Configuración de índices
        builder.HasIndex(r => r.NormalizedName)
            .IsUnique();
    }
}
