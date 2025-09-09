import { useState, useEffect } from 'react';
import { DashboardState, Story, Post, ActiveModel } from '../../domain/interfaces/Dashboard';

export const useDashboard = () => {
  const [state, setState] = useState<DashboardState>({
    loading: true,
    activeSection: 'inicio',
    anchorEl: null,
    showNotificationsPanel: false,
    showMessagesPanel: false,
    showFavoritesPanel: false,
    showConfigPanel: false,
  });

  const [stories, setStories] = useState<Story[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeModels, setActiveModels] = useState<ActiveModel[]>([]);

  const updateState = (updates: Partial<DashboardState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const loadDashboardData = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      // Cargar datos desde API o usar mock data
      const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      
      // Mock data como fallback
      const mockStories: Story[] = [
        {
          id: '1',
          username: 'Mi Historia',
          avatar: 'https://picsum.photos/400/400?random=10',
          isViewed: false,
          isOwn: true
        }
      ];

      const mockPosts: Post[] = [
        {
          id: '1',
          username: 'Usuario',
          avatar: 'https://picsum.photos/400/400?random=20',
          content: '¡Hola! Compartiendo contenido increíble 💕',
          image: 'https://picsum.photos/600/400?random=21',
          likes: 45,
          comments: 12,
          timestamp: '2h',
          isLiked: false
        }
      ];

      const mockActiveModels: ActiveModel[] = [
        {
          id: '1',
          username: 'ModeloVIP',
          avatar: 'https://picsum.photos/400/400?random=30',
          isLive: true,
          viewers: 156,
          category: 'VIP',
          isLiked: false
        }
      ];

      setStories(mockStories);
      setPosts(mockPosts);
      setActiveModels(mockActiveModels);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return {
    state,
    stories,
    posts,
    activeModels,
    updateState,
    loadDashboardData,
    setStories,
    setPosts,
    setActiveModels
  };
};
