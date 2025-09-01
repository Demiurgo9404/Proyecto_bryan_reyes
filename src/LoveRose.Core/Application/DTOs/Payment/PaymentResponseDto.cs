using System;
using LoveRose.Core.Enums;

namespace LoveRose.Core.Application.DTOs.Payment
{
    public class PaymentResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public string TransactionId { get; set; }
        public string ExternalTransactionId { get; set; }
        public PaymentStatus Status { get; set; }
        public DateTime ProcessedAt { get; set; }
        public string RedirectUrl { get; set; }
        public object Metadata { get; set; }

        public static PaymentResponseDto SuccessResponse(string message, string transactionId, string externalTransactionId, PaymentStatus status, string redirectUrl = null, object metadata = null)
        {
            return new PaymentResponseDto
            {
                Success = true,
                Message = message,
                TransactionId = transactionId,
                ExternalTransactionId = externalTransactionId,
                Status = status,
                ProcessedAt = DateTime.UtcNow,
                RedirectUrl = redirectUrl,
                Metadata = metadata
            };
        }

        public static PaymentResponseDto ErrorResponse(string message, string transactionId = null)
        {
            return new PaymentResponseDto
            {
                Success = false,
                Message = message,
                TransactionId = transactionId,
                Status = PaymentStatus.Failed,
                ProcessedAt = DateTime.UtcNow
            };
        }
    }
}
