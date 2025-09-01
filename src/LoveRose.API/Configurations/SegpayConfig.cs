using System;

namespace LoveRose.API.Configurations
{
    public class SegpayConfig
    {
        public string BaseUrl { get; set; }
        public string MerchantId { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
        public string ReturnUrl { get; set; }
        public string CallbackUrl { get; set; }
        public string WebhookSecret { get; set; }
        
        public void Validate()
        {
            if (string.IsNullOrWhiteSpace(BaseUrl))
                throw new ArgumentNullException(nameof(BaseUrl), "La URL base de Segpay es requerida");
                
            if (string.IsNullOrWhiteSpace(MerchantId))
                throw new ArgumentNullException(nameof(MerchantId), "El ID de comerciante de Segpay es requerido");
                
            if (string.IsNullOrWhiteSpace(Username) || string.IsNullOrWhiteSpace(Password))
                throw new ArgumentNullException("Se requieren las credenciales de autenticación de Segpay");
                
            if (string.IsNullOrWhiteSpace(ReturnUrl))
                throw new ArgumentNullException(nameof(ReturnUrl), "La URL de retorno es requerida");
                
            if (string.IsNullOrWhiteSpace(CallbackUrl))
                throw new ArgumentNullException(nameof(CallbackUrl), "La URL de callback es requerida");
        }
    }
}
