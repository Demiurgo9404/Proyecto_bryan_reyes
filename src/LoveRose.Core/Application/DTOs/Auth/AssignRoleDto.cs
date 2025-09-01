using System.ComponentModel.DataAnnotations;
using LoveRose.Core.Enums;

namespace LoveRose.Core.Application.DTOs.Auth;

public class AssignRoleDto
{
    [Required(ErrorMessage = "El ID del usuario es requerido")]
    public string UserId { get; set; } = string.Empty;

    [Required(ErrorMessage = "El rol es requerido")]
    public UserRole Role { get; set; }
}
