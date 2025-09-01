using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using LoveRose.Core.Domain.Entities;

namespace LoveRose.Core.Domain.Interfaces.Repositories
{
    public interface IPaymentRepository : IRepository<Payment>
    {
        Task<Payment> GetByExternalTransactionIdAsync(string transactionId);
        Task<IEnumerable<Payment>> GetByUserIdAsync(string userId);
        Task<IEnumerable<Payment>> GetByStatusAsync(PaymentStatus status);
        Task<Payment> GetWithUserAsync(Guid paymentId);
    }
}
