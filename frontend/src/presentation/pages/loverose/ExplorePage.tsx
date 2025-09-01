import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardMedia,
  Typography,
  Avatar,
  IconButton,
  Chip,
  Button,
} from '@mui/material';
import {
  Favorite,
  ChatBubbleOutline,
  PlayArrow,
  MoreVert,
  Verified,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../../contexts/AuthContext';

const ExploreContainer = styled(Box)({
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
  paddingTop: '74px',
  maxWidth: '975px',
  margin: '0 auto',
  padding: '74px 20px 20px',
});

const TrendingSection = styled(Box)({
  marginBottom: '24px',
});

const TrendingChip = styled(Chip)({
  backgroundColor: '#ffffff',
  border: '1px solid #dbdbdb',
  margin: '4px',
  '&:hover': {
    backgroundColor: '#f5f5f5',
  },
});

const PostCard = styled(Card)({
  position: 'relative',
  cursor: 'pointer',
  borderRadius: '4px',
  overflow: 'hidden',
  '&:hover .post-overlay': {
    opacity: 1,
  },
});

const PostOverlay = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.3)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  opacity: 0,
  transition: 'opacity 0.2s ease',
  color: 'white',
  gap: '20px',
});

const PostStats = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  fontSize: '16px',
  fontWeight: '600',
});

const VideoIndicator = styled(Box)({
  position: 'absolute',
  top: '8px',
  right: '8px',
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  borderRadius: '4px',
  padding: '4px',
  color: 'white',
});

const SuggestedUsers = styled(Box)({
  backgroundColor: '#ffffff',
  border: '1px solid #dbdbdb',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '24px',
});

const UserCard = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '16px',
  border: '1px solid #dbdbdb',
  borderRadius: '8px',
  backgroundColor: '#ffffff',
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'transform 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
  },
});

const UserAvatar = styled(Avatar)({
  width: '56px',
  height: '56px',
  marginBottom: '8px',
});

const Username = styled(Typography)({
  fontSize: '14px',
  fontWeight: '600',
  color: '#262626',
  marginBottom: '4px',
});

const UserSubtext = styled(Typography)({
  fontSize: '12px',
  color: '#8e8e8e',
  marginBottom: '12px',
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

interface Post {
  id: number;
  media_url: string;
  media_type: 'image' | 'video';
  likes_count: number;
  comments_count: number;
  size?: 'small' | 'medium' | 'large';
}

interface User {
  id: number;
  username: string;
  display_name: string;
  avatar: string;
  is_verified: boolean;
  followers_count: number;
  mutual_followers: string[];
}

const ExplorePage: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadExploreData();
  }, []);

  const loadExploreData = async () => {
    setIsLoading(true);
    try {
      // Load explore posts
      const postsResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/posts/explore`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (postsResponse.ok) {
        const postsData = await postsResponse.json();
        setPosts(postsData.posts || []);
      } else {
        loadMockData();
      }

      // Load suggested users
      const usersResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/suggested`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setSuggestedUsers(usersData.users || []);
      }

      // Load trending topics
      const trendingResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/trending`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (trendingResponse.ok) {
        const trendingData = await trendingResponse.json();
        setTrendingTopics(trendingData.topics || []);
      }
    } catch (error) {
      console.error('Error loading explore data:', error);
      loadMockData();
    } finally {
      setIsLoading(false);
    }
  };

  const loadMockData = () => {
    // Mock posts with varied sizes for LoveRose-style grid
    const mockPosts: Post[] = [
      // Large post (2x2)
      {
        id: 1,
        media_url: '/api/placeholder/400/400',
        media_type: 'image',
        likes_count: 2341,
        comments_count: 156,
        size: 'large',
      },
      // Regular posts
      {
        id: 2,
        media_url: '/api/placeholder/300/300',
        media_type: 'video',
        likes_count: 892,
        comments_count: 43,
        size: 'small',
      },
      {
        id: 3,
        media_url: '/api/placeholder/300/300',
        media_type: 'image',
        likes_count: 1567,
        comments_count: 89,
        size: 'small',
      },
      {
        id: 4,
        media_url: '/api/placeholder/300/300',
        media_type: 'image',
        likes_count: 743,
        comments_count: 21,
        size: 'small',
      },
      {
        id: 5,
        media_url: '/api/placeholder/300/300',
        media_type: 'video',
        likes_count: 1234,
        comments_count: 67,
        size: 'small',
      },
      // Another large post
      {
        id: 6,
        media_url: '/api/placeholder/400/400',
        media_type: 'image',
        likes_count: 3456,
        comments_count: 234,
        size: 'large',
      },
    ];

    const mockUsers: User[] = [
      {
        id: 1,
        username: 'emma_model',
        display_name: 'Emma Wilson',
        avatar: '/api/placeholder/56/56',
        is_verified: true,
        followers_count: 45230,
        mutual_followers: ['maria_model', 'sofia_rose'],
      },
      {
        id: 2,
        username: 'alex_photo',
        display_name: 'Alex Photography',
        avatar: '/api/placeholder/56/56',
        is_verified: false,
        followers_count: 12450,
        mutual_followers: ['maria_model'],
      },
      {
        id: 3,
        username: 'lucia_art',
        display_name: 'Lucia Artist',
        avatar: '/api/placeholder/56/56',
        is_verified: true,
        followers_count: 67890,
        mutual_followers: ['sofia_rose', 'ana_beauty'],
      },
    ];

    const mockTrending = [
      '#sunset', '#photography', '#model', '#art', '#fashion', 
      '#travel', '#food', '#fitness', '#music', '#dance'
    ];

    setPosts(mockPosts);
    setSuggestedUsers(mockUsers);
    setTrendingTopics(mockTrending);
  };

  const getGridItemSize = (index: number) => {
    // Create LoveRose-style varied grid layout
    if (index === 0) return { xs: 8, sm: 8 }; // Large featured post
    if ((index - 1) % 7 === 0) return { xs: 8, sm: 8 }; // Every 7th post is large
    return { xs: 4, sm: 4 }; // Regular posts
  };

  const handleFollow = async (userId: number) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/${userId}/follow`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.ok) {
        setSuggestedUsers(prev =>
          prev.filter(user => user.id !== userId)
        );
      }
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handlePostClick = (postId: number) => {
    // Navigate to post detail or open modal
    console.log('Post clicked:', postId);
  };

  if (isLoading) {
    return (
      <ExploreContainer>
        <Header>
          <Typography variant="h6" sx={{ fontWeight: '600', color: '#262626' }}>
            Explore
          </Typography>
        </Header>
        <MainContent>
          <Typography>Loading...</Typography>
        </MainContent>
      </ExploreContainer>
    );
  }

  return (
    <ExploreContainer>
      <Header>
        <Typography variant="h6" sx={{ fontWeight: '600', color: '#262626' }}>
          Explore
        </Typography>
      </Header>

      <MainContent>
        {/* Trending Topics */}
        <TrendingSection>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: '600', color: '#262626' }}>
            Trending
          </Typography>
          <Box>
            {trendingTopics.map((topic, index) => (
              <TrendingChip
                key={index}
                label={topic}
                clickable
                size="small"
              />
            ))}
          </Box>
        </TrendingSection>

        {/* Suggested Users */}
        {suggestedUsers.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: '600', color: '#262626' }}>
              Suggested for you
            </Typography>
            <Grid container spacing={2}>
              {suggestedUsers.map((suggestedUser) => (
                <Grid item xs={6} sm={4} md={3} key={suggestedUser.id}>
                  <UserCard>
                    <UserAvatar src={suggestedUser.avatar} />
                    <Box display="flex" alignItems="center">
                      <Username>{suggestedUser.username}</Username>
                      {suggestedUser.is_verified && (
                        <Verified sx={{ fontSize: 12, color: '#0095f6', ml: 0.5 }} />
                      )}
                    </Box>
                    <UserSubtext>
                      {suggestedUser.mutual_followers.length > 0
                        ? `Followed by ${suggestedUser.mutual_followers[0]}${
                            suggestedUser.mutual_followers.length > 1
                              ? ` + ${suggestedUser.mutual_followers.length - 1} more`
                              : ''
                          }`
                        : `${suggestedUser.followers_count.toLocaleString()} followers`
                      }
                    </UserSubtext>
                    <FollowButton onClick={() => handleFollow(suggestedUser.id)}>
                      Follow
                    </FollowButton>
                  </UserCard>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Posts Grid */}
        <Grid container spacing={1}>
          {posts.map((post, index) => (
            <Grid item {...getGridItemSize(index)} key={post.id}>
              <PostCard onClick={() => handlePostClick(post.id)}>
                <CardMedia
                  component="img"
                  image={post.media_url}
                  alt="Explore post"
                  sx={{
                    aspectRatio: '1',
                    objectFit: 'cover',
                  }}
                />
                
                {post.media_type === 'video' && (
                  <VideoIndicator>
                    <PlayArrow sx={{ fontSize: 16 }} />
                  </VideoIndicator>
                )}

                <PostOverlay className="post-overlay">
                  <PostStats>
                    <Favorite sx={{ fontSize: 20, mr: 0.5 }} />
                    {post.likes_count.toLocaleString()}
                  </PostStats>
                  <PostStats>
                    <ChatBubbleOutline sx={{ fontSize: 20, mr: 0.5 }} />
                    {post.comments_count}
                  </PostStats>
                </PostOverlay>
              </PostCard>
            </Grid>
          ))}
        </Grid>
      </MainContent>
    </ExploreContainer>
  );
};

export default ExplorePage;
