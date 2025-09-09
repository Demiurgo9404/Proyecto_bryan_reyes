using System;
using System.Threading;
using System.Threading.Tasks;

namespace LoveRose.Core.Domain.Interfaces
{
    public interface IUnitOfWork : IDisposable
    {
        IUserRepository Users { get; }
        IRoleRepository Roles { get; }
        
        Task<int> CompleteAsync(CancellationToken cancellationToken = default);
        
        Task BeginTransactionAsync(CancellationToken cancellationToken = default);
        Task CommitTransactionAsync(CancellationToken cancellationToken = default);
        Task RollbackTransactionAsync(CancellationToken cancellationToken = default);
        
        bool HasActiveTransaction { get; }
    }
}
