using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using LoveRose.Core.Domain.Entities;
using LoveRose.Core.Domain.Interfaces.Services;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace LoveRose.Infrastructure.Services.Payment
{
    public class SegpayService : IPaymentService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<SegpayService> _logger;
        private readonly SegpaySettings _settings;

        public SegpayService(
            HttpClient httpClient,
            IOptions<SegpaySettings> settings,
            ILogger<SegpayService> logger)
        {
            _httpClient = httpClient ?? throw new ArgumentNullException(nameof(httpClient));
            _settings = settings?.Value ?? throw new ArgumentNullException(nameof(settings));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<PaymentResult> ProcessPaymentAsync(Payment payment)
        {
            try
            {
                _logger.LogInformation("Iniciando procesamiento de pago con Segpay para el pago {PaymentId}", payment.Id);

                var request = new SegpayPaymentRequest
                {
                    MerchantId = _settings.MerchantId,
                    Amount = payment.Amount,
                    Currency = payment.Currency,
                    CustomerEmail = GetCustomerEmail(payment.Metadata),
                    CustomerId = payment.UserId,
                    OrderId = payment.Id.ToString(),
                    ReturnUrl = _settings.ReturnUrl,
                    CallbackUrl = _settings.CallbackUrl,
                    Metadata = JsonSerializer.Deserialize<Dictionary<string, string>>(payment.Metadata ?? "{}")
                };

                // Autenticación básica para Segpay
                var authString = Convert.ToBase64String(
                    System.Text.Encoding.ASCII.GetBytes($"{_settings.Username}:{_settings.Password}"));
                
                _httpClient.DefaultRequestHeaders.Authorization = 
                    new System.Net.Http.Headers.AuthenticationHeaderValue("Basic", authString);

                var response = await _httpClient.PostAsJsonAsync(
                    "payments/process", request);

                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogError("Error en la respuesta de Segpay: {StatusCode} - {Content}", 
                        response.StatusCode, errorContent);
                    
                    return new PaymentResult
                    {
                        Success = false,
                        Message = "Error al procesar el pago con Segpay",
                        Status = PaymentStatus.Failed
                    };
                }

                var result = await response.Content.ReadFromJsonAsync<SegpayPaymentResponse>();

                return new PaymentResult
                {
                    Success = result.Success,
                    ExternalTransactionId = result.TransactionId,
                    Status = MapStatus(result.Status),
                    Message = result.Message,
                    RedirectUrl = result.RedirectUrl,
                    Metadata = result
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al procesar pago con Segpay: {Message}", ex.Message);
                return new PaymentResult
                {
                    Success = false,
                    Message = "Error interno al procesar el pago",
                    Status = PaymentStatus.Failed
                };
            }
        }

        public async Task<PaymentResult> GetPaymentStatusAsync(string transactionId)
        {
            try
            {
                var response = await _httpClient.GetAsync($"payments/status/{transactionId}");
                response.EnsureSuccessStatusCode();

                var result = await response.Content.ReadFromJsonAsync<SegpayPaymentResponse>();
                
                return new PaymentResult
                {
                    Success = result.Success,
                    ExternalTransactionId = result.TransactionId,
                    Status = MapStatus(result.Status),
                    Message = result.Message
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener estado de pago: {Message}", ex.Message);
                throw;
            }
        }

        public async Task<PaymentResult> RefundPaymentAsync(string transactionId, decimal? amount = null)
        {
            try
            {
                var request = new { TransactionId = transactionId, Amount = amount };
                var response = await _httpClient.PostAsJsonAsync("payments/refund", request);
                response.EnsureSuccessStatusCode();

                var result = await response.Content.ReadFromJsonAsync<SegpayRefundResponse>();
                
                return new PaymentResult
                {
                    Success = result.Success,
                    ExternalTransactionId = result.RefundId,
                    Status = PaymentStatus.Refunded,
                    Message = result.Message
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al reembolsar pago: {Message}", ex.Message);
                throw;
            }
        }

        private string GetCustomerEmail(string metadataJson)
        {
            try
            {
                if (string.IsNullOrEmpty(metadataJson)) 
                    return null;
                    
                var metadata = JsonSerializer.Deserialize<Dictionary<string, string>>(metadataJson);
                return metadata?.GetValueOrDefault("email");
            }
            catch
            {
                return null;
            }
        }

        private PaymentStatus MapStatus(string segpayStatus)
        {
            return segpayStatus?.ToLower() switch
            {
                "approved" => PaymentStatus.Completed,
                "pending" => PaymentStatus.Pending,
                "declined" => PaymentStatus.Failed,
                "refunded" => PaymentStatus.Refunded,
                "cancelled" => PaymentStatus.Cancelled,
                _ => PaymentStatus.Failed
            };
        }
    }

    public class SegpaySettings
    {
        public string BaseUrl { get; set; }
        public string MerchantId { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
        public string ReturnUrl { get; set; }
        public string CallbackUrl { get; set; }
    }

    public class SegpayPaymentRequest
    {
        public string MerchantId { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; }
        public string CustomerEmail { get; set; }
        public string CustomerId { get; set; }
        public string OrderId { get; set; }
        public string ReturnUrl { get; set; }
        public string CallbackUrl { get; set; }
        public Dictionary<string, string> Metadata { get; set; }
    }

    public class SegpayPaymentResponse
    {
        public bool Success { get; set; }
        public string TransactionId { get; set; }
        public string Status { get; set; }
        public string Message { get; set; }
        public string RedirectUrl { get; set; }
    }

    public class SegpayRefundResponse
    {
        public bool Success { get; set; }
        public string RefundId { get; set; }
        public string Message { get; set; }
    }
}
