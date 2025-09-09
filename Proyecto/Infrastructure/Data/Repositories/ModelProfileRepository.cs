using Microsoft.EntityFrameworkCore;
using Proyecto.Core.Entities;
using Proyecto.Core.Interfaces.Repositories;
using System.Linq.Expressions;

namespace Proyecto.Infrastructure.Data.Repositories;

public class ModelProfileRepository : EfRepository<ModelProfile>, IModelProfileRepository
{
    public ModelProfileRepository(ApplicationDbContext dbContext) : base(dbContext)
    {
    }

    public async Task<ModelProfile?> GetByUserIdAsync(string userId)
    {
        return await _dbSet.FirstOrDefaultAsync(mp => mp.UserId == userId);
    }

    public async Task<IEnumerable<ModelProfile>> GetTopModelsAsync(int count)
    {
        return await _dbSet
            .Where(mp => mp.IsActive && mp.IsOnline)
            .OrderByDescending(mp => mp.Rating)
            .ThenByDescending(mp => mp.ViewCount)
            .Take(count)
            .ToListAsync();
    }

    public async Task<IEnumerable<ModelProfile>> SearchAsync(string query, int page, int pageSize)
    {
        var searchQuery = query.ToLower();
        
        return await _dbSet
            .Where(mp => mp.IsActive && 
                        (mp.DisplayName.ToLower().Contains(searchQuery) || 
                         mp.Bio.ToLower().Contains(searchQuery) ||
                         mp.Tags.ToLower().Contains(searchQuery)))
            .OrderByDescending(mp => mp.IsOnline)
            .ThenByDescending(mp => mp.Rating)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task UpdateModelStatsAsync(int modelProfileId)
    {
        var model = await GetByIdAsync(modelProfileId);
        if (model == null) return;

        // Update stats based on related entities
        model.ViewCount = await _dbContext.ContentInteractions
            .CountAsync(ci => ci.Content.ModelProfileId == modelProfileId && 
                            ci.InteractionType == "View");

        model.LikeCount = await _dbContext.ContentInteractions
            .CountAsync(ci => ci.Content.ModelProfileId == modelProfileId && 
                            ci.InteractionType == "Like");

        model.FollowerCount = await _dbContext.Follows
            .CountAsync(f => f.FollowedId == modelProfileId);

        // Calculate rating (this is a simple average, adjust as needed)
        var ratings = await _dbContext.Ratings
            .Where(r => r.ModelProfileId == modelProfileId)
            .Select(r => r.Score)
            .ToListAsync();

        model.Rating = ratings.Any() ? ratings.Average() : 0;

        await UpdateAsync(model);
    }

    public async Task ToggleOnlineStatusAsync(int modelProfileId, bool isOnline)
    {
        var model = await GetByIdAsync(modelProfileId);
        if (model != null)
        {
            model.IsOnline = isOnline;
            model.LastOnline = DateTime.UtcNow;
            await UpdateAsync(model);
        }
    }

    public async Task UpdateLastSeenAsync(int modelProfileId)
    {
        var model = await GetByIdAsync(modelProfileId);
        if (model != null)
        {
            model.LastOnline = DateTime.UtcNow;
            await UpdateAsync(model);
        }
    }
}
