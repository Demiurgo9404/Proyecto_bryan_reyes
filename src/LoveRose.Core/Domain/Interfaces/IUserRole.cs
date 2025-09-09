using System;
using Microsoft.AspNetCore.Identity;

namespace LoveRose.Core.Domain.Interfaces
{
    public interface IUserRole
    {
        int UserId { get; set; }
        int RoleId { get; set; }
        DateTime AssignedAt { get; }
        string? AssignedBy { get; set; }
        DateTime? ExpiresAt { get; set; }
        bool IsActive { get; set; }
    }
}
