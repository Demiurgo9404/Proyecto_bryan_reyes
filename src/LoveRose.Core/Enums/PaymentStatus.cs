namespace LoveRose.Core.Enums
{
    public enum PaymentStatus
    {
        Pending,    // El pago está pendiente de procesar
        Processing, // El pago está siendo procesado
        Completed,  // El pago se completó exitosamente
        Failed,     // El pago falló
        Refunded,   // El pago fue reembolsado
        Cancelled   // El pago fue cancelado
    }
}
