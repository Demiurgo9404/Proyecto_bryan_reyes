// Estadísticas básicas
export interface BasicAnalytics {
  totalViews: number;
  totalLikes: number;
  totalShares: number;
  totalComments: number;
  averageViewDuration: number;
  engagementRate: number;
  followerGrowth: { date: string; count: number }[];
}

// Análisis de audiencia
export interface AudienceDemographics {
  ageRanges: { range: string; percentage: number }[];
  genders: { gender: string; percentage: number }[];
  locations: { location: string; percentage: number }[];
  languages: { language: string; percentage: number }[];
}

// Análisis de ingresos
export interface RevenueAnalytics {
  daily: { date: string; amount: number }[];
  weekly: { week: string; amount: number }[];
  monthly: { month: string; amount: number }[];
  bySource: { source: string; amount: number }[];
}

// Rendimiento de contenido
export interface ContentPerformance {
  id: string;
  title: string;
  views: number;
  likes: number;
  shares: number;
  comments: number;
  earnings: number;
  duration: number;
  publishedAt: Date;
}

// Análisis de suscripciones
export interface SubscriptionAnalytics {
  totalSubscribers: number;
  newSubscribers: number;
  churnRate: number;
  arpu: number; // Average Revenue Per User
  mrr: number;  // Monthly Recurring Revenue
  plans: { name: string; count: number; revenue: number }[];
  growthRate: number;
  retentionRate: number;
}

// Análisis de sesiones
export interface SessionAnalytics {
  totalSessions: number;
  averageSessionLength: number;
  peakSessionTimes: { hour: number; count: number }[];
  completionRate: number;
  earningsPerSession: number;
  byType: { type: string; count: number; earnings: number }[];
  byDay: { day: string; count: number; earnings: number }[];
  byClient: { clientId: string; name: string; sessions: number; totalSpent: number }[];
}

// Análisis de notificaciones
export interface NotificationAnalytics {
  totalSent: number;
  openRate: number;
  clickRate: number;
  byType: { type: string; sent: number; opened: number; clicked: number }[];
  conversionRate: number;
  revenueAttributed: number;
}

// Seguimiento de objetivos
export interface GoalTracking {
  name: string;
  target: number;
  current: number;
  unit: string;
  deadline?: Date;
  progress: number;
}

// Análisis completo del modelo
export interface ModelAnalytics {
  basic: BasicAnalytics;
  audience: AudienceDemographics;
  revenue: RevenueAnalytics;
  contentPerformance: ContentPerformance[];
  subscriptions: SubscriptionAnalytics;
  sessions: SessionAnalytics;
  notifications: NotificationAnalytics;
  goals: GoalTracking[];
}
