// Interfaces estándar para todos los dashboards
export interface Story {
  id: string;
  username: string;
  avatar: string;
  isViewed: boolean;
  isOwn?: boolean;
}

export interface Post {
  id: string;
  username: string;
  avatar: string;
  content: string;
  image?: string;
  video?: string;
  likes: number;
  comments: number;
  timestamp: string;
  isLiked: boolean;
  location?: string;
}

export interface ActiveModel {
  id: string;
  username: string;
  avatar: string;
  isLive: boolean;
  viewers: number;
  category: 'Premium' | 'VIP' | 'Standard';
  isLiked: boolean;
}

export interface DashboardState {
  loading: boolean;
  activeSection: string;
  anchorEl: HTMLElement | null;
  showNotificationsPanel: boolean;
  showMessagesPanel: boolean;
  showFavoritesPanel: boolean;
  showConfigPanel: boolean;
}

export interface DashboardProps {
  user?: any;
  onNavigate?: (path: string) => void;
}
