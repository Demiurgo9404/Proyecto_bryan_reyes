using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace LoveRose.Core.Application.DTOs.Payment
{
    public class ProcessPaymentDto
    {
        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "El monto debe ser mayor a cero")]
        public decimal Amount { get; set; }

        [Required]
        [StringLength(3, MinimumLength = 3, ErrorMessage = "El código de moneda debe tener 3 caracteres")]
        public string Currency { get; set; }

        [Required]
        public string PaymentMethodId { get; set; }

        [Required]
        public string UserId { get; set; }

        public string OrderId { get; set; }
        
        public string Description { get; set; }

        public Dictionary<string, string> Metadata { get; set; } = new Dictionary<string, string>();
    }
}
