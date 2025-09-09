using System.Linq.Expressions;

namespace Proyecto.Core.Interfaces.Repositories;

public interface IRepository<T> where T : class
{
    Task<T?> GetByIdAsync<TId>(TId id) where TId : notnull;
    Task<IEnumerable<T>> GetAllAsync();
    Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate);
    Task<T> AddAsync(T entity);
    Task UpdateAsync(T entity);
    Task DeleteAsync(T entity);
    Task<bool> ExistsAsync(Expression<Func<T, bool>> predicate);
    Task<int> CountAsync(Expression<Func<T, bool>>? predicate = null);
}
