using System;
using System.Collections.Generic;

namespace LoveRose.Core.Dtos.Auth
{
    public class AuthResponse
    {
        public string AccessToken { get; set; }
        public string RefreshToken { get; set; }
        public DateTime AccessTokenExpiration { get; set; }
        public string UserId { get; set; }
        public string Email { get; set; }
        public string Username { get; set; }
        public IList<string> Roles { get; set; } = new List<string>();
        public bool EmailConfirmed { get; set; }
        public string FullName { get; set; }
        public string ProfileImageUrl { get; set; }
    }

    public class AuthErrorResponse
    {
        public string Error { get; set; }
        public string ErrorDescription { get; set; }
        public IDictionary<string, string[]> Errors { get; set; }
    }
}
