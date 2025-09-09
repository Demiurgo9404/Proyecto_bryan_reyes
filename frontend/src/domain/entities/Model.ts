// Perfil del modelo
export interface ModelProfile extends Omit<Model, 'email' | 'rating' | 'totalSessions' | 'isAvailable' | 'tags' | 'createdAt' | 'updatedAt'> {
  categories: string[];
  languages: string[];
  coverImage?: string;
  stats?: ModelAnalytics;
}

// Análisis del modelo
export interface ModelAnalytics {
  totalEarnings: number;
  totalSessions: number;
  totalHours: number;
  avgRating: number;
  totalFans: number;
  monthlyEarnings: Array<{
    month: string;
    amount: number;
  }>;
  popularTimes: Array<{
    day: string;
    hour: number;
    count: number;
  }>;
}

// Modelo base
export interface Model {
  id: string;
  username: string;
  email: string;
  displayName: string;
  bio: string;
  avatar: string;
  isOnline: boolean;
  lastSeen?: Date;
  hourlyRate: number;
  rating: number;
  totalSessions: number;
  isAvailable: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Estadísticas del modelo
export interface ModelStats {
  totalEarnings: number;
  thisMonthEarnings: number;
  totalSessions: number;
  averageRating: number;
  activeConnections: number;
  totalHoursStreamed: number;
  totalTips: number;
  totalFavorites: number;
  responseRate: number;
  responseTime: number; // en minutos
}

// Slot de disponibilidad
export interface AvailabilitySlot {
  id: string;
  dayOfWeek: number; // 0-6 (Domingo a Sábado)
  startTime: string; // Formato HH:mm
  endTime: string;   // Formato HH:mm
  isRecurring: boolean;
  timezone: string;
}

// Sesión programada
export interface ScheduledSession {
  id: string;
  clientId: string;
  clientName: string;
  clientAvatar?: string;
  startTime: Date;
  endTime: Date;
  duration: number; // en minutos
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  type: 'private' | 'group' | 'event';
  rate: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
