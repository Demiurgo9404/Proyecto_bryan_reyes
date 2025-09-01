using System;
using System.Threading.Tasks;
using LoveRose.Core.Application.DTOs.Payment;
using LoveRose.Core.Application.UseCases.Payment;
using LoveRose.Core.Domain.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace LoveRose.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PaymentsController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ILogger<PaymentsController> _logger;
        private readonly IPaymentService _paymentService;

        public PaymentsController(
            IMediator mediator,
            ILogger<PaymentsController> logger,
            IPaymentService paymentService)
        {
            _mediator = mediator ?? throw new ArgumentNullException(nameof(mediator));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _paymentService = paymentService ?? throw new ArgumentNullException(nameof(paymentService));
        }

        /// <summary>
        /// Procesa un nuevo pago
        /// </summary>
        /// <param name="request">Datos del pago a procesar</param>
        /// <returns>Resultado del procesamiento del pago</returns>
        [HttpPost]
        [ProducesResponseType(typeof(PaymentResponseDto), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(401)]
        public async Task<IActionResult> ProcessPayment([FromBody] ProcessPaymentDto request)
        {
            try
            {
                _logger.LogInformation("Solicitud de pago recibida para el usuario {UserId}", request.UserId);
                
                var command = new ProcessPaymentCommand(request);
                var result = await _mediator.Send(command);
                
                if (!result.Success)
                {
                    _logger.LogWarning("Error al procesar el pago: {Message}", result.Message);
                    return BadRequest(new { result.Message });
                }

                _logger.LogInformation("Pago procesado exitosamente. ID de transacción: {TransactionId}", result.TransactionId);
                
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al procesar el pago: {Message}", ex.Message);
                return StatusCode(500, new { Message = "Ocurrió un error al procesar el pago" });
            }
        }

        /// <summary>
        /// Obtiene el estado de un pago
        /// </summary>
        /// <param name="transactionId">ID de la transacción</param>
        /// <returns>Estado actual del pago</returns>
        [HttpGet("status/{transactionId}")]
        [ProducesResponseType(typeof(PaymentResponseDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetPaymentStatus(string transactionId)
        {
            try
            {
                var result = await _paymentService.GetPaymentStatusAsync(transactionId);
                
                if (!result.Success)
                {
                    return NotFound(new { result.Message });
                }

                var response = new PaymentResponseDto
                {
                    Success = result.Success,
                    Message = result.Message,
                    TransactionId = transactionId,
                    ExternalTransactionId = result.ExternalTransactionId,
                    Status = result.Status,
                    ProcessedAt = DateTime.UtcNow
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener estado del pago: {Message}", ex.Message);
                return StatusCode(500, new { Message = "Error al obtener el estado del pago" });
            }
        }

        /// <summary>
        /// Webhook para notificaciones de Segpay
        /// </summary>
        [HttpPost("webhook/segpay")]
        [AllowAnonymous]
        public async Task<IActionResult> SegpayWebhook([FromBody] dynamic payload)
        {
            try
            {
                _logger.LogInformation("Webhook recibido de Segpay: {Payload}", payload?.ToString());
                
                // Aquí deberías validar la firma del webhook
                // y procesar la notificación según la documentación de Segpay
                
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al procesar webhook de Segpay: {Message}", ex.Message);
                return StatusCode(500);
            }
        }
    }
}
