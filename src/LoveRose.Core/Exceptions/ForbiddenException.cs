using System;

namespace LoveRose.Core.Exceptions
{
    public class ForbiddenException : Exception
    {
        public ForbiddenException() : base("Acceso denegado")
        {
        }

        public ForbiddenException(string message) : base(message)
        {
        }

        public ForbiddenException(string message, Exception innerException) 
            : base(message, innerException)
        {
        }
    }
}
