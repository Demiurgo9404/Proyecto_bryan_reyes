namespace LoveRose.Core.Domain.Entities;

public class Follow
{
    public Guid Id { get; set; }
    
    // Usuario que sigue
    public Guid FollowerId { get; set; }
    public User Follower { get; set; } = null!;
    
    // Usuario seguido
    public Guid FollowingId { get; set; }
    public User Following { get; set; } = null!;
    
    public DateTime CreatedAt { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    // Para cuentas privadas
    public FollowStatus Status { get; set; } = FollowStatus.Accepted;
    
    // Para amigos cercanos
    public bool IsCloseFriend { get; set; } = false;
    
    // Para notificaciones
    public bool NotificationsEnabled { get; set; } = true;
}

public enum FollowStatus
{
    Pending = 1,    // Solicitud pendiente (cuenta privada)
    Accepted = 2,   // Seguimiento aceptado
    Blocked = 3     // Usuario bloqueado
}

public class Block
{
    public Guid Id { get; set; }
    
    // Usuario que bloquea
    public Guid BlockerId { get; set; }
    public User Blocker { get; set; } = null!;
    
    // Usuario bloqueado
    public Guid BlockedId { get; set; }
    public User Blocked { get; set; } = null!;
    
    public DateTime CreatedAt { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    public BlockType Type { get; set; } = BlockType.Full;
}

public enum BlockType
{
    Full = 1,       // Bloqueo completo
    Mute = 2,       // Silenciar (no ver contenido pero no bloquear)
    Restrict = 3    // Restringir (limitar interacciones)
}
