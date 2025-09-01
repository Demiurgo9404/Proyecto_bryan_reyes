using MediatR;
using LoveRose.Core.Application.DTOs.Payment;

namespace LoveRose.Core.Application.UseCases.Payment
{
    public class ProcessPaymentCommand : IRequest<PaymentResponseDto>
    {
        public ProcessPaymentDto PaymentRequest { get; }

        public ProcessPaymentCommand(ProcessPaymentDto paymentRequest)
        {
            PaymentRequest = paymentRequest;
        }
    }
}
