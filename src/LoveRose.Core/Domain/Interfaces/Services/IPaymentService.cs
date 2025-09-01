using System.Threading.Tasks;
using LoveRose.Core.Domain.Entities;

namespace LoveRose.Core.Domain.Interfaces.Services
{
    public interface IPaymentService
    {
        Task<PaymentResult> ProcessPaymentAsync(Payment payment);
        Task<PaymentResult> GetPaymentStatusAsync(string transactionId);
        Task<PaymentResult> RefundPaymentAsync(string transactionId, decimal? amount = null);
    }

    public class PaymentResult
    {
        public bool Success { get; set; }
        public string ExternalTransactionId { get; set; }
        public PaymentStatus Status { get; set; }
        public string Message { get; set; }
        public string RedirectUrl { get; set; }
        public object Metadata { get; set; }
    }
}
