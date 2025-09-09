using Proyecto.Core.Entities;
using Proyecto.Core.Interfaces.Repositories;
using Proyecto.Core.Interfaces.Services;
using System.Linq.Expressions;

namespace Proyecto.Core.Services;

public abstract class Service<T, TId> : IService<T, TId> where T : BaseEntity
{
    protected readonly IRepository<T> _repository;

    protected Service(IRepository<T> repository)
    {
        _repository = repository ?? throw new ArgumentNullException(nameof(repository));
    }

    public virtual async Task<T?> GetByIdAsync(TId id)
    {
        return await _repository.GetByIdAsync(id);
    }

    public virtual async Task<IEnumerable<T>> GetAllAsync()
    {
        return await _repository.GetAllAsync();
    }

    public virtual async Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate)
    {
        return await _repository.FindAsync(predicate);
    }

    public virtual async Task<T> AddAsync(T entity)
    {
        return await _repository.AddAsync(entity);
    }

    public virtual async Task UpdateAsync(T entity)
    {
        await _repository.UpdateAsync(entity);
    }

    public virtual async Task DeleteAsync(T entity)
    {
        await _repository.DeleteAsync(entity);
    }

    public virtual async Task<bool> ExistsAsync(Expression<Func<T, bool>> predicate)
    {
        return await _repository.ExistsAsync(predicate);
    }

    public virtual async Task<int> CountAsync(Expression<Func<T, bool>>? predicate = null)
    {
        return await _repository.CountAsync(predicate);
    }
}
