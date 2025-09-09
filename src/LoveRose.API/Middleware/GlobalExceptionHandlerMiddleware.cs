using System;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using LoveRose.Core.Exceptions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace LoveRose.API.Middleware
{
    public class GlobalExceptionHandlerMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<GlobalExceptionHandlerMiddleware> _logger;
        private readonly bool _isDevelopment;

        public GlobalExceptionHandlerMiddleware(
            RequestDelegate next,
            ILogger<GlobalExceptionHandlerMiddleware> logger,
            IWebHostEnvironment env)
        {
            _next = next;
            _logger = logger;
            _isDevelopment = env.IsDevelopment();
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                await HandleExceptionAsync(context, ex);
            }
        }

        private async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";
            var response = context.Response;
            var errorResponse = new ErrorResponse();

            switch (exception)
            {
                case ValidationException ex:
                    response.StatusCode = (int)HttpStatusCode.BadRequest;
                    errorResponse.Message = "Error de validación";
                    errorResponse.Errors = ex.Errors;
                    break;
                
                case UnauthorizedAccessException _:
                    response.StatusCode = (int)HttpStatusCode.Unauthorized;
                    errorResponse.Message = "No autorizado";
                    break;
                
                case KeyNotFoundException _:
                    response.StatusCode = (int)HttpStatusCode.NotFound;
                    errorResponse.Message = "Recurso no encontrado";
                    break;
                
                case ForbiddenException _:
                    response.StatusCode = (int)HttpStatusCode.Forbidden;
                    errorResponse.Message = "No tiene permisos para acceder a este recurso";
                    break;
                
                default:
                    // Error no manejado
                    response.StatusCode = (int)HttpStatusCode.InternalServerError;
                    errorResponse.Message = "Ha ocurrido un error interno en el servidor";
                    
                    // Solo incluir detalles del error en desarrollo
                    if (_isDevelopment)
                    {
                        errorResponse.Details = exception.Message;
                        errorResponse.StackTrace = exception.StackTrace;
                    }
                    
                    _logger.LogError(exception, "Error no manejado: {Message}", exception.Message);
                    break;
            }

            // Si es un error de validación, también registramos los errores
            if (exception is ValidationException validationEx)
            {
                _logger.LogWarning("Error de validación: {Message} - Errores: {Errors}", 
                    exception.Message, 
                    JsonSerializer.Serialize(validationEx.Errors));
            }
            else if (response.StatusCode >= 500)
            {
                _logger.LogError(exception, "Error interno del servidor: {Message}", exception.Message);
            }

            // Configurar la respuesta
            errorResponse.StatusCode = response.StatusCode;
            errorResponse.Type = exception.GetType().Name;
            
            var result = JsonSerializer.Serialize(errorResponse, new JsonSerializerOptions 
            { 
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = true
            });
            
            await response.WriteAsync(result);
        }
    }

    public static class GlobalExceptionHandlerMiddlewareExtensions
    {
        public static IApplicationBuilder UseGlobalExceptionHandler(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<GlobalExceptionHandlerMiddleware>();
        }
    }

    public class ErrorResponse
    {
        public int StatusCode { get; set; }
        public string Type { get; set; }
        public string Message { get; set; }
        public IDictionary<string, string[]> Errors { get; set; }
        public string Details { get; set; }
        public string StackTrace { get; set; }
        public DateTime Timestamp => DateTime.UtcNow;
    }
}
