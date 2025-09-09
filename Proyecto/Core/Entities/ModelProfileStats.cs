namespace Proyecto.Core.Entities;

public class ModelProfileStats
{
    public int TotalViews { get; set; }
    public int TotalLikes { get; set; }
    public int TotalFollowers { get; set; }
    public int TotalContent { get; set; }
    public int TotalEarnings { get; set; }
    public decimal AverageRating { get; set; }
    public int TotalSessions { get; set; }
    public int TotalHoursStreamed { get; set; }
    public int TotalMessages { get; set; }
    public int TotalTips { get; set; }
    public Dictionary<string, int> ContentTypeDistribution { get; set; } = new();
    public Dictionary<string, int> FollowerGrowth { get; set; } = new();
    public Dictionary<string, int> EarningsByMonth { get; set; } = new();
}
