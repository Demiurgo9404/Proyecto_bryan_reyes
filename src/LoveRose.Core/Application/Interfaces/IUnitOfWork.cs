using System;
using System.Data;
using Microsoft.EntityFrameworkCore.Storage;
using System.Threading;
using System.Threading.Tasks;

namespace LoveRose.Core.Application.Interfaces;

public interface IUnitOfWork : IDisposable, IAsyncDisposable
{
    // Métodos para obtener repositorios
    IRepository<T> GetRepository<T>() where T : class;
    
    // Métodos para guardar cambios
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    
    // Gestión de transacciones
    Task<IDbContextTransaction> BeginTransactionAsync(CancellationToken cancellationToken = default);
    Task CommitTransactionAsync(CancellationToken cancellationToken = default);
    Task RollbackTransactionAsync(CancellationToken cancellationToken = default);
    
    // Método obsoleto para compatibilidad
    [System.Obsolete("Use RollbackTransactionAsync instead")]
    Task RollbackAsync(CancellationToken cancellationToken = default);
}
