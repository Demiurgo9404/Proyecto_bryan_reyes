namespace LoveRose.Core.Domain.Enums
{
    public enum TransactionStatus
    {
        Pending,
        Completed,
        Failed,
        Refunded,
        PartiallyRefunded,
        Cancelled,
        OnHold
    }

    public enum TransactionType
    {
        Tip,
        Subscription,
        PayPerView,
        VideoCall,
        PrivateMessage,
        PostPromotion,
        AdRevenue,
        Withdrawal,
        Refund,
        Chargeback,
        Donation,
        Gift,
        ReferralBonus,
        AdminAdjustment
    }
}
