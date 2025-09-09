using Proyecto.Core.Entities;

namespace Proyecto.Core.Interfaces.Services;

public interface IModelProfileService : IService<ModelProfile, int>
{
    Task<ModelProfile?> GetByUserIdAsync(string userId);
    Task<IEnumerable<ModelProfile>> GetTopModelsAsync(int count = 10);
    Task<IEnumerable<ModelProfile>> SearchModelsAsync(string query, int page = 1, int pageSize = 20);
    Task UpdateModelStatsAsync(int modelProfileId);
    Task ToggleOnlineStatusAsync(int modelProfileId, bool isOnline);
    Task UpdateLastSeenAsync(int modelProfileId);
    Task<ModelProfile> UpdateProfileAsync(int modelProfileId, string displayName, string bio, string tags, bool isPrivate);
    Task UpdateProfileImageAsync(int modelProfileId, string imageUrl);
    Task UpdateCoverImageAsync(int modelProfileId, string imageUrl);
    Task<IEnumerable<Content>> GetModelContentAsync(int modelProfileId, int page = 1, int pageSize = 20, string? contentType = null);
    Task<ModelProfileStats> GetModelStatsAsync(int modelProfileId);
}
