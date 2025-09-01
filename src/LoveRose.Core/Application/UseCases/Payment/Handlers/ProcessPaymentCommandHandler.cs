using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using LoveRose.Core.Application.DTOs.Payment;
using LoveRose.Core.Domain.Entities;
using LoveRose.Core.Domain.Interfaces.Repositories;
using LoveRose.Core.Domain.Interfaces.Services;
using Microsoft.Extensions.Logging;

namespace LoveRose.Core.Application.UseCases.Payment.Handlers
{
    public class ProcessPaymentCommandHandler : IRequestHandler<ProcessPaymentCommand, PaymentResponseDto>
    {
        private readonly IPaymentRepository _paymentRepository;
        private readonly IPaymentService _paymentService;
        private readonly ILogger<ProcessPaymentCommandHandler> _logger;

        public ProcessPaymentCommandHandler(
            IPaymentRepository paymentRepository,
            IPaymentService paymentService,
            ILogger<ProcessPaymentCommandHandler> logger)
        {
            _paymentRepository = paymentRepository ?? throw new ArgumentNullException(nameof(paymentRepository));
            _paymentService = paymentService ?? throw new ArgumentNullException(nameof(paymentService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<PaymentResponseDto> Handle(ProcessPaymentCommand request, CancellationToken cancellationToken)
        {
            try
            {
                _logger.LogInformation("Iniciando procesamiento de pago para el usuario {UserId}", request.PaymentRequest.UserId);

                // Crear entidad de pago
                var payment = new Payment
                {
                    Amount = request.PaymentRequest.Amount,
                    Currency = request.PaymentRequest.Currency,
                    PaymentMethodId = request.PaymentRequest.PaymentMethodId,
                    UserId = request.PaymentRequest.UserId,
                    Metadata = System.Text.Json.JsonSerializer.Serialize(request.PaymentRequest.Metadata)
                };

                // Procesar pago a través del servicio de pago
                var paymentResult = await _paymentService.ProcessPaymentAsync(payment);
                
                // Actualizar entidad con resultado
                payment.Status = paymentResult.Status;
                payment.ExternalTransactionId = paymentResult.ExternalTransactionId;
                payment.ProcessedAt = DateTime.UtcNow;

                // Guardar en base de datos
                await _paymentRepository.AddAsync(payment);
                await _paymentRepository.UnitOfWork.CommitAsync(cancellationToken);

                _logger.LogInformation("Pago procesado exitosamente. ID de transacción: {TransactionId}", payment.ExternalTransactionId);

                return PaymentResponseDto.SuccessResponse(
                    "Pago procesado exitosamente",
                    payment.Id.ToString(),
                    payment.ExternalTransactionId,
                    payment.Status,
                    paymentResult.RedirectUrl,
                    paymentResult.Metadata
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al procesar el pago: {Message}", ex.Message);
                
                return PaymentResponseDto.ErrorResponse(
                    "Ocurrió un error al procesar el pago. Por favor, intente nuevamente."
                );
            }
        }
    }
}
