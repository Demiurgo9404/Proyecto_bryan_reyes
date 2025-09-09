namespace LoveRose.Core.Domain.Enums
{
    /// <summary>
    /// Represents the gender of a user
    /// </summary>
    public enum Gender
    {
        /// <summary>
        /// Male gender
        /// </summary>
        Male,

        /// <summary>
        /// Female gender
        /// </summary>
        Female,

        /// <summary>
        /// Other gender
        /// </summary>
        Other,

        /// <summary>
        /// Prefer not to disclose gender
        /// </summary>
        PreferNotToSay
    }

    /// <summary>
    /// Represents the type of user account
    /// </summary>
    public enum UserType
    {
        /// <summary>
        /// Standard user account
        /// </summary>
        Standard,

        /// <summary>
        /// Premium user account with additional features
        /// </summary>
        Premium,

        /// <summary>
        /// VIP user account with exclusive benefits
        /// </summary>
        VIP,

        /// <summary>
        /// Model account for content creators
        /// </summary>
        Model,

        /// <summary>
        /// Administrator account with full access
        /// </summary>
        Admin
    }

    /// <summary>
    /// Represents the current status of a user account
    /// </summary>
    public enum UserStatus
    {
        /// <summary>
        /// Account is active and in good standing
        /// </summary>
        Active,

        /// <summary>
        /// Account is inactive (user-initiated)
        /// </summary>
        Inactive,

        /// <summary>
        /// Account is suspended by administrators
        /// </summary>
        Suspended,

        /// <summary>
        /// Account is banned from the platform
        /// </summary>
        Banned
    }
}
