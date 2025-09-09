using Proyecto.Core.Entities;
using System.Linq.Expressions;

namespace Proyecto.Core.Interfaces.Repositories;

public interface IModelProfileRepository
{
    Task<ModelProfile?> GetByIdAsync(int id);
    Task<ModelProfile?> GetByUserIdAsync(string userId);
    Task<IEnumerable<ModelProfile>> GetAllAsync();
    Task<IEnumerable<ModelProfile>> FindAsync(Expression<Func<ModelProfile, bool>> predicate);
    Task<ModelProfile> AddAsync(ModelProfile modelProfile);
    Task UpdateAsync(ModelProfile modelProfile);
    Task DeleteAsync(int id);
    Task<bool> ExistsAsync(int id);
    Task<int> CountAsync(Expression<Func<ModelProfile, bool>>? predicate = null);
    
    // Model-specific methods
    Task<IEnumerable<ModelProfile>> GetTopModelsAsync(int count);
    Task<IEnumerable<ModelProfile>> SearchAsync(string query, int page, int pageSize);
    Task UpdateModelStatsAsync(int modelProfileId);
    Task ToggleOnlineStatusAsync(int modelProfileId, bool isOnline);
    Task UpdateLastSeenAsync(int modelProfileId);
}
