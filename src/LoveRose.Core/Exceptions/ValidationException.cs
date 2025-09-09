using System;
using System.Collections.Generic;

namespace LoveRose.Core.Exceptions
{
    public class ValidationException : Exception
    {
        public IDictionary<string, string[]> Errors { get; }

        public ValidationException() : base("Uno o más errores de validación han ocurrido")
        {
            Errors = new Dictionary<string, string[]>();
        }

        public ValidationException(IDictionary<string, string[]> errors) 
            : this()
        {
            Errors = errors;
        }

        public ValidationException(string message) : base(message)
        {
            Errors = new Dictionary<string, string[]>
            {
                { "Error", new[] { message } }
            };
        }

        public ValidationException(string message, Exception innerException) 
            : base(message, innerException)
        {
            Errors = new Dictionary<string, string[]>
            {
                { "Error", new[] { message } }
            };
        }
    }
}
