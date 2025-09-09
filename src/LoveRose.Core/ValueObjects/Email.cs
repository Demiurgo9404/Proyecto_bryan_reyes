using System;
using System.Text.RegularExpressions;

namespace LoveRose.Core.ValueObjects
{
    public class Email
    {
        public string Value { get; private set; }

        private Email(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
                throw new ArgumentException("El correo electrónico no puede estar vacío", nameof(value));

            if (!IsValidEmail(value))
                throw new ArgumentException("El formato del correo electrónico no es válido", nameof(value));

            Value = value.Trim().ToLower();
        }

        public static Email Create(string email) => new Email(email);

        private static bool IsValidEmail(string email)
        {
            try
            {
                var addr = new System.Net.Mail.MailAddress(email);
                return addr.Address == email;
            }
            catch
            {
                return false;
            }
        }

        public static implicit operator string(Email email) => email.Value;
        public static explicit operator Email(string email) => new Email(email);

        public override string ToString() => Value;
    }
}
