using LoveRose.Core.Domain.Entities;
using LoveRose.Core.Domain.Entities.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace LoveRose.Infrastructure.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser, Role, int,
        IdentityUserClaim<int>, UserRole, IdentityUserLogin<int>,
        IdentityRoleClaim<int>, IdentityUserToken<int>>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // DbSets for all entities
        public DbSet<Post> Posts { get; set; }
        public DbSet<PostMedia> PostMedia { get; set; }
        public DbSet<Comment> Comments { get; set; }
        public DbSet<Like> Likes { get; set; }
        public DbSet<Follow> Follows { get; set; }
        public DbSet<Message> Messages { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<VideoCall> VideoCalls { get; set; }
        public DbSet<Transaction> Transactions { get; set; }
        public DbSet<Bookmark> Bookmarks { get; set; }
        public DbSet<Story> Stories { get; set; }
        public DbSet<StoryView> StoryViews { get; set; }
        public DbSet<StoryReaction> StoryReactions { get; set; }
        public DbSet<StoryReply> StoryReplies { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure table names and schema
            modelBuilder.HasDefaultSchema("love_rose");

            // Configure ApplicationUser entity
            modelBuilder.Entity<ApplicationUser>(entity =>
            {
                entity.ToTable("users");
                
                // Properties
                entity.Property(u => u.FirstName).HasMaxLength(100);
                entity.Property(u => u.LastName).HasMaxLength(100);
                entity.Property(u => u.DisplayName).HasMaxLength(150);
                entity.Property(u => u.Bio).HasMaxLength(500);
                entity.Property(u => u.AvatarUrl).HasMaxLength(500);
                entity.Property(u => u.CoverImageUrl).HasMaxLength(500);
                entity.Property(u => u.Website).HasMaxLength(200);
                entity.Property(u => u.Location).HasMaxLength(200);
                entity.Property(u => u.TimeZone).HasDefaultValue("UTC");
                entity.Property(u => u.Language).HasDefaultValue("es");
                entity.Property(u => u.Theme).HasDefaultValue("light");
                entity.Property(u => u.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                
                // Relationships
                entity.HasMany(u => u.Posts)
                    .WithOne(p => p.User)
                    .HasForeignKey(p => p.UserId)
                    .OnDelete(DeleteBehavior.Restrict);
                    
                entity.HasMany(u => u.Comments)
                    .WithOne(c => c.User)
                    .HasForeignKey(c => c.UserId)
                    .OnDelete(DeleteBehavior.Restrict);
                    
                entity.HasMany(u => u.Likes)
                    .WithOne(l => l.User)
                    .HasForeignKey(l => l.UserId)
                    .OnDelete(DeleteBehavior.Restrict);
                    
                entity.HasMany(u => u.SentMessages)
                    .WithOne(m => m.Sender)
                    .HasForeignKey(m => m.SenderId)
                    .OnDelete(DeleteBehavior.Restrict);
                    
                entity.HasMany(u => u.ReceivedMessages)
                    .WithOne(m => m.Receiver)
                    .HasForeignKey(m => m.ReceiverId)
                    .OnDelete(DeleteBehavior.Restrict);
                    
                entity.HasMany(u => u.RefreshTokens)
                    .WithOne(rt => rt.User)
                    .HasForeignKey(rt => rt.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Configure Role entity
            modelBuilder.Entity<Role>(entity =>
            {
                entity.ToTable("roles");
                
                // Properties
                entity.Property(r => r.Description).HasMaxLength(500);
                entity.Property(r => r.Color).HasMaxLength(50);
                entity.Property(r => r.Permissions).HasMaxLength(4000);
                entity.Property(r => r.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                
                // Relationships
                entity.HasMany(r => r.UserRoles)
                    .WithOne(ur => ur.Role)
                    .HasForeignKey(ur => ur.RoleId)
                    .IsRequired();
                    
                entity.HasMany(r => r.RoleClaims)
                    .WithOne(rc => rc.Role)
                    .HasForeignKey(rc => rc.RoleId)
                    .IsRequired();
            });

            // Configure UserRole entity
            modelBuilder.Entity<UserRole>(entity =>
            {
                entity.ToTable("user_roles");
                
                // Properties
                entity.Property(ur => ur.AssignedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.Property(ur => ur.AssignedBy).HasMaxLength(450);
                entity.Property(ur => ur.IsActive).HasDefaultValue(true);
                
                // Composite primary key
                entity.HasKey(ur => new { ur.UserId, ur.RoleId });
                
                // Relationships
                entity.HasOne(ur => ur.Role)
                    .WithMany(r => r.UserRoles)
                    .HasForeignKey(ur => ur.RoleId)
                    .IsRequired();
                    
                entity.HasOne(ur => ur.User)
                    .WithMany(u => u.UserRoles)
                    .HasForeignKey(ur => ur.UserId)
                    .IsRequired();
            });

            // Configure Post entity
            modelBuilder.Entity<Post>(entity =>
            {
                entity.ToTable("posts");
                
                entity.HasOne(p => p.User)
                    .WithMany(u => u.Posts)
                    .HasForeignKey(p => p.UserId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasMany(p => p.Comments)
                    .WithOne(c => c.Post)
                    .HasForeignKey(c => c.PostId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasMany(p => p.Likes)
                    .WithOne(l => l.Post)
                    .HasForeignKey(l => l.PostId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasMany(p => p.Bookmarks)
                    .WithOne(b => b.Post)
                    .HasForeignKey(b => b.PostId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasMany(p => p.Media)
                    .WithOne(m => m.Post)
                    .HasForeignKey(m => m.PostId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Configure Story entity
            modelBuilder.Entity<Story>(entity =>
            {
                entity.ToTable("stories");
                
                entity.HasMany(s => s.Views)
                    .WithOne(v => v.Story)
                    .HasForeignKey(v => v.StoryId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasMany(s => s.Reactions)
                    .WithOne(r => r.Story)
                    .HasForeignKey(r => r.StoryId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasMany(s => s.Replies)
                    .WithOne(r => r.Story)
                    .HasForeignKey(r => r.StoryId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Configure composite keys for many-to-many relationships
            modelBuilder.Entity<Follow>()
                .HasKey(f => new { f.FollowerId, f.FollowingId });

            // Configure indexes for better query performance
            modelBuilder.Entity<Post>()
                .HasIndex(p => p.UserId);

            modelBuilder.Entity<Comment>()
                .HasIndex(c => c.UserId);

            modelBuilder.Entity<Comment>()
                .HasIndex(c => c.PostId);

            modelBuilder.Entity<Like>()
                .HasIndex(l => l.UserId);

            modelBuilder.Entity<Like>()
                .HasIndex(l => l.PostId);

            modelBuilder.Entity<Message>()
                .HasIndex(m => m.SenderId);

            modelBuilder.Entity<Message>()
                .HasIndex(m => m.ReceiverId);

            modelBuilder.Entity<Notification>()
                .HasIndex(n => n.UserId);

            modelBuilder.Entity<VideoCall>()
                .HasIndex(vc => vc.CallerId);

            modelBuilder.Entity<VideoCall>()
                .HasIndex(vc => vc.CalleeId);

            modelBuilder.Entity<Transaction>()
                .HasIndex(t => t.SenderId);

            modelBuilder.Entity<Transaction>()
                .HasIndex(t => t.RecipientId);

            modelBuilder.Entity<Bookmark>()
                .HasIndex(b => b.UserId);

            modelBuilder.Entity<Bookmark>()
                .HasIndex(b => b.PostId);

            // Configure value conversions for enums
            modelBuilder.Entity<Post>()
                .Property(p => p.Visibility)
                .HasConversion<string>();

            modelBuilder.Entity<VideoCall>()
                .Property(vc => vc.Status)
                .HasConversion<string>();

            modelBuilder.Entity<Transaction>()
                .Property(t => t.Status)
                .HasConversion<string>();

            modelBuilder.Entity<Transaction>()
                .Property(t => t.Type)
                .HasConversion<string>();

            modelBuilder.Entity<Notification>()
                .Property(n => n.Type)
                .HasConversion<string>();

            modelBuilder.Entity<Story>()
                .Property(s => s.Type)
                .HasConversion<string>();

            modelBuilder.Entity<Story>()
                .Property(s => s.MediaType)
                .HasConversion<string>();
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            var entries = ChangeTracker
                .Entries()
                .Where(e => e.Entity is BaseEntity && (
                    e.State == EntityState.Added
                    || e.State == EntityState.Modified));

            foreach (var entityEntry in entries)
            {
                ((BaseEntity)entityEntry.Entity).UpdatedAt = DateTime.UtcNow;

                if (entityEntry.State == EntityState.Added)
                {
                    ((BaseEntity)entityEntry.Entity).CreatedAt = DateTime.UtcNow;
                }
            }

            return base.SaveChangesAsync(cancellationToken);
        }
    }
}
