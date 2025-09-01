import React, { useState, useEffect } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  IconButton,
  Button,
  Chip,
  Tabs,
  Tab,
  Badge,
} from '@mui/material';
import {
  Favorite,
  PersonAdd,
  ChatBubbleOutline,
  VideoCall,
  AttachMoney,
  MoreVert,
  Check,
  Close,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../../contexts/AuthContext';

const NotificationsContainer = styled(Box)({
  minHeight: '100vh',
  backgroundColor: '#fafafa',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
});

const Header = styled(Box)({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  height: '54px',
  backgroundColor: '#ffffff',
  borderBottom: '1px solid #dbdbdb',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
});

const MainContent = styled(Box)({
  paddingTop: '54px',
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  minHeight: 'calc(100vh - 54px)',
});

const TabsContainer = styled(Box)({
  borderBottom: '1px solid #dbdbdb',
  backgroundColor: '#ffffff',
});

const NotificationItem = styled(ListItem)({
  padding: '16px 20px',
  borderBottom: '1px solid #efefef',
  '&:hover': {
    backgroundColor: '#f8f9fa',
  },
  '&.unread': {
    backgroundColor: '#f0f8ff',
  },
});

const NotificationIcon = styled(Box)({
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: '12px',
});

const ActionButtons = styled(Box)({
  display: 'flex',
  gap: '8px',
  marginTop: '8px',
});

const FollowButton = styled(Button)({
  fontSize: '12px',
  fontWeight: '600',
  textTransform: 'none',
  backgroundColor: '#0095f6',
  color: '#ffffff',
  padding: '4px 16px',
  borderRadius: '4px',
  '&:hover': {
    backgroundColor: '#1877f2',
  },
});

const RejectButton = styled(Button)({
  fontSize: '12px',
  fontWeight: '600',
  textTransform: 'none',
  border: '1px solid #dbdbdb',
  color: '#262626',
  padding: '4px 16px',
  borderRadius: '4px',
  '&:hover': {
    backgroundColor: '#f5f5f5',
  },
});

const TimeStamp = styled(Typography)({
  fontSize: '12px',
  color: '#8e8e8e',
  marginTop: '4px',
});

interface Notification {
  id: number;
  type: 'like' | 'comment' | 'follow' | 'follow_request' | 'video_call' | 'tip' | 'mention';
  user: {
    id: number;
    username: string;
    display_name: string;
    avatar: string;
    is_verified: boolean;
  };
  content?: string;
  post?: {
    id: number;
    media_url: string;
  };
  is_read: boolean;
  created_at: string;
  metadata?: {
    amount?: number;
    call_duration?: number;
  };
}

const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, [activeTab]);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const filterType = activeTab === 0 ? 'all' : activeTab === 1 ? 'following' : 'you';
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/notifications?filter=${filterType}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      } else {
        loadMockNotifications();
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      loadMockNotifications();
    } finally {
      setIsLoading(false);
    }
  };

  const loadMockNotifications = () => {
    const mockNotifications: Notification[] = [
      {
        id: 1,
        type: 'like',
        user: {
          id: 1,
          username: 'emma_model',
          display_name: 'Emma Wilson',
          avatar: '/api/placeholder/40/40',
          is_verified: true,
        },
        post: {
          id: 1,
          media_url: '/api/placeholder/60/60',
        },
        is_read: false,
        created_at: '2024-01-15T14:30:00Z',
      },
      {
        id: 2,
        type: 'follow_request',
        user: {
          id: 2,
          username: 'sofia_dance',
          display_name: 'Sofia Rodriguez',
          avatar: '/api/placeholder/40/40',
          is_verified: false,
        },
        is_read: false,
        created_at: '2024-01-15T13:15:00Z',
      },
      {
        id: 3,
        type: 'comment',
        user: {
          id: 3,
          username: 'maria_art',
          display_name: 'Maria Garcia',
          avatar: '/api/placeholder/40/40',
          is_verified: true,
        },
        content: 'Amazing shot! 🔥',
        post: {
          id: 2,
          media_url: '/api/placeholder/60/60',
        },
        is_read: true,
        created_at: '2024-01-15T12:45:00Z',
      },
      {
        id: 4,
        type: 'video_call',
        user: {
          id: 4,
          username: 'ana_beauty',
          display_name: 'Ana Martinez',
          avatar: '/api/placeholder/40/40',
          is_verified: false,
        },
        is_read: true,
        created_at: '2024-01-15T11:20:00Z',
        metadata: {
          call_duration: 15,
        },
      },
      {
        id: 5,
        type: 'tip',
        user: {
          id: 5,
          username: 'carlos_fan',
          display_name: 'Carlos Rodriguez',
          avatar: '/api/placeholder/40/40',
          is_verified: false,
        },
        is_read: false,
        created_at: '2024-01-15T10:30:00Z',
        metadata: {
          amount: 25,
        },
      },
      {
        id: 6,
        type: 'follow',
        user: {
          id: 6,
          username: 'lucia_photo',
          display_name: 'Lucia Fernandez',
          avatar: '/api/placeholder/40/40',
          is_verified: true,
        },
        is_read: true,
        created_at: '2024-01-14T18:45:00Z',
      },
    ];

    setNotifications(mockNotifications);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const markAsRead = async (notificationId: number) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/notifications/${notificationId}/read`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === notificationId ? { ...notif, is_read: true } : notif
          )
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleFollowRequest = async (userId: number, action: 'accept' | 'reject') => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/${userId}/follow-request`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ action }),
        }
      );

      if (response.ok) {
        setNotifications(prev =>
          prev.filter(notif => !(notif.type === 'follow_request' && notif.user.id === userId))
        );
      }
    } catch (error) {
      console.error('Error handling follow request:', error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);

    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d`;
    return `${Math.floor(diffInMinutes / 10080)}w`;
  };

  const getNotificationText = (notification: Notification) => {
    switch (notification.type) {
      case 'like':
        return 'liked your post';
      case 'comment':
        return `commented: ${notification.content}`;
      case 'follow':
        return 'started following you';
      case 'follow_request':
        return 'requested to follow you';
      case 'video_call':
        return `had a video call with you (${notification.metadata?.call_duration}m)`;
      case 'tip':
        return `sent you a tip of $${notification.metadata?.amount}`;
      case 'mention':
        return 'mentioned you in a post';
      default:
        return '';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Favorite sx={{ color: '#ff3040', fontSize: 20 }} />;
      case 'comment':
        return <ChatBubbleOutline sx={{ color: '#0095f6', fontSize: 20 }} />;
      case 'follow':
      case 'follow_request':
        return <PersonAdd sx={{ color: '#0095f6', fontSize: 20 }} />;
      case 'video_call':
        return <VideoCall sx={{ color: '#00c851', fontSize: 20 }} />;
      case 'tip':
        return <AttachMoney sx={{ color: '#ffbb33', fontSize: 20 }} />;
      default:
        return <Favorite sx={{ color: '#8e8e8e', fontSize: 20 }} />;
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (isLoading) {
    return (
      <NotificationsContainer>
        <Header>
          <Typography variant="h6" sx={{ fontWeight: '600', color: '#262626' }}>
            Notifications
          </Typography>
        </Header>
        <MainContent>
          <Box display="flex" justifyContent="center" alignItems="center" height="200px">
            <Typography>Loading notifications...</Typography>
          </Box>
        </MainContent>
      </NotificationsContainer>
    );
  }

  return (
    <NotificationsContainer>
      <Header>
        <Typography variant="h6" sx={{ fontWeight: '600', color: '#262626' }}>
          Notifications
          {unreadCount > 0 && (
            <Badge
              badgeContent={unreadCount}
              color="error"
              sx={{ ml: 1 }}
            />
          )}
        </Typography>
      </Header>

      <MainContent>
        <TabsContainer>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: '600',
                fontSize: '14px',
              },
            }}
          >
            <Tab label="All" />
            <Tab label="Following" />
            <Tab label="You" />
          </Tabs>
        </TabsContainer>

        <List sx={{ padding: 0 }}>
          {notifications.length === 0 ? (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              height="300px"
              color="#8e8e8e"
            >
              <Typography variant="h6" sx={{ mb: 1 }}>
                No notifications yet
              </Typography>
              <Typography variant="body2">
                When someone likes or comments on your posts, you'll see it here
              </Typography>
            </Box>
          ) : (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                className={!notification.is_read ? 'unread' : ''}
                onClick={() => !notification.is_read && markAsRead(notification.id)}
              >
                <ListItemAvatar>
                  <Box position="relative">
                    <Avatar src={notification.user.avatar} />
                    <NotificationIcon
                      sx={{
                        position: 'absolute',
                        bottom: -4,
                        right: -4,
                        backgroundColor: '#ffffff',
                        border: '2px solid #ffffff',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                      }}
                    >
                      {getNotificationIcon(notification.type)}
                    </NotificationIcon>
                  </Box>
                </ListItemAvatar>

                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box flex={1}>
                        <Typography variant="body2" sx={{ lineHeight: 1.4 }}>
                          <strong>{notification.user.username}</strong>{' '}
                          {getNotificationText(notification)}
                        </Typography>
                        <TimeStamp>
                          {formatTimeAgo(notification.created_at)}
                        </TimeStamp>
                      </Box>
                      
                      {notification.post && (
                        <Avatar
                          src={notification.post.media_url}
                          variant="square"
                          sx={{ width: 44, height: 44, ml: 2 }}
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    notification.type === 'follow_request' && (
                      <ActionButtons>
                        <FollowButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFollowRequest(notification.user.id, 'accept');
                          }}
                        >
                          Accept
                        </FollowButton>
                        <RejectButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFollowRequest(notification.user.id, 'reject');
                          }}
                        >
                          Decline
                        </RejectButton>
                      </ActionButtons>
                    )
                  }
                />

                <IconButton size="small">
                  <MoreVert />
                </IconButton>
              </NotificationItem>
            ))
          )}
        </List>
      </MainContent>
    </NotificationsContainer>
  );
};

export default NotificationsPage;
