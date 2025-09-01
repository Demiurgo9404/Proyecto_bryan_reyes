import React, { useState, useEffect } from 'react';
import {
  Box,
  Avatar,
  Typography,
  Button,
  IconButton,
  Grid,
  Card,
  CardMedia,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
} from '@mui/material';
import {
  Settings,
  MoreVert,
  GridOn,
  BookmarkBorder,
  PersonOutline,
  Add,
  Verified,
  Edit,
  Link as LinkIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../../contexts/AuthContext';

const ProfileContainer = styled(Box)({
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
  justifyContent: 'space-between',
  padding: '0 20px',
  zIndex: 1000,
});

const MainContent = styled(Box)({
  paddingTop: '54px',
  maxWidth: '935px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  minHeight: 'calc(100vh - 54px)',
});

const ProfileHeader = styled(Box)({
  padding: '30px 20px',
  display: 'flex',
  alignItems: 'flex-start',
  gap: '30px',
  '@media (max-width: 735px)': {
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '20px',
  },
});

const ProfileAvatar = styled(Avatar)({
  width: '150px',
  height: '150px',
  '@media (max-width: 735px)': {
    width: '77px',
    height: '77px',
  },
});

const ProfileInfo = styled(Box)({
  flex: 1,
});

const UsernameRow = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '20px',
  marginBottom: '20px',
  '@media (max-width: 735px)': {
    flexDirection: 'column',
    gap: '15px',
  },
});

const Username = styled(Typography)({
  fontSize: '28px',
  fontWeight: '300',
  color: '#262626',
  '@media (max-width: 735px)': {
    fontSize: '24px',
  },
});

const ActionButton = styled(Button)({
  fontSize: '14px',
  fontWeight: '600',
  textTransform: 'none',
  padding: '5px 9px',
  borderRadius: '4px',
  minWidth: 'auto',
});

const EditButton = styled(ActionButton)({
  border: '1px solid #dbdbdb',
  color: '#262626',
  '&:hover': {
    backgroundColor: '#f5f5f5',
  },
});

const FollowButton = styled(ActionButton)({
  backgroundColor: '#0095f6',
  color: '#ffffff',
  '&:hover': {
    backgroundColor: '#1877f2',
  },
});

const StatsRow = styled(Box)({
  display: 'flex',
  gap: '40px',
  marginBottom: '20px',
  '@media (max-width: 735px)': {
    justifyContent: 'center',
  },
});

const StatItem = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  cursor: 'pointer',
});

const StatNumber = styled(Typography)({
  fontSize: '16px',
  fontWeight: '600',
  color: '#262626',
});

const StatLabel = styled(Typography)({
  fontSize: '16px',
  color: '#262626',
});

const Bio = styled(Typography)({
  fontSize: '16px',
  lineHeight: 1.5,
  color: '#262626',
  marginBottom: '4px',
});

const BioLink = styled(Typography)({
  fontSize: '16px',
  color: '#00376b',
  cursor: 'pointer',
  '&:hover': {
    textDecoration: 'underline',
  },
});

const TabsContainer = styled(Box)({
  borderTop: '1px solid #dbdbdb',
});

const PostsGrid = styled(Grid)({
  padding: '20px 0',
});

const PostCard = styled(Card)({
  position: 'relative',
  cursor: 'pointer',
  aspectRatio: '1',
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

const EmptyState = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '60px 20px',
  color: '#8e8e8e',
});

interface Post {
  id: number;
  media_url: string;
  media_type: 'image' | 'video';
  likes_count: number;
  comments_count: number;
  caption?: string;
}

interface UserProfile {
  id: number;
  username: string;
  display_name: string;
  avatar: string;
  bio?: string;
  website?: string;
  is_verified: boolean;
  is_private: boolean;
  posts_count: number;
  followers_count: number;
  following_count: number;
  is_following?: boolean;
  is_own_profile: boolean;
}

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [taggedPosts, setTaggedPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    display_name: '',
    bio: '',
    website: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      loadPosts();
    }
  }, [profile, activeTab]);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      // For now, load current user's profile
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/profile`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        setEditForm({
          display_name: data.profile.display_name || '',
          bio: data.profile.bio || '',
          website: data.profile.website || '',
        });
      } else {
        loadMockProfile();
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      loadMockProfile();
    } finally {
      setIsLoading(false);
    }
  };

  const loadMockProfile = () => {
    const mockProfile: UserProfile = {
      id: user?.id || 1,
      username: user?.username || 'your_username',
      display_name: user?.display_name || 'Your Name',
      avatar: user?.avatar || '/api/placeholder/150/150',
      bio: 'Living life to the fullest ✨\nModel & Content Creator 📸\nLove, Art & Adventure 💕',
      website: 'https://loverose.com',
      is_verified: false,
      is_private: false,
      posts_count: 42,
      followers_count: 1234,
      following_count: 567,
      is_own_profile: true,
    };

    setProfile(mockProfile);
    setEditForm({
      display_name: mockProfile.display_name,
      bio: mockProfile.bio || '',
      website: mockProfile.website || '',
    });
  };

  const loadPosts = async () => {
    try {
      let endpoint = '';
      switch (activeTab) {
        case 0:
          endpoint = '/api/users/posts';
          break;
        case 1:
          endpoint = '/api/users/saved-posts';
          break;
        case 2:
          endpoint = '/api/users/tagged-posts';
          break;
        default:
          endpoint = '/api/users/posts';
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const postsData = data.posts || [];
        
        switch (activeTab) {
          case 0:
            setPosts(postsData);
            break;
          case 1:
            setSavedPosts(postsData);
            break;
          case 2:
            setTaggedPosts(postsData);
            break;
        }
      } else {
        loadMockPosts();
      }
    } catch (error) {
      console.error('Error loading posts:', error);
      loadMockPosts();
    }
  };

  const loadMockPosts = () => {
    const mockPosts: Post[] = [
      {
        id: 1,
        media_url: '/api/placeholder/300/300',
        media_type: 'image',
        likes_count: 234,
        comments_count: 12,
        caption: 'Beautiful sunset today! 🌅',
      },
      {
        id: 2,
        media_url: '/api/placeholder/300/300',
        media_type: 'video',
        likes_count: 456,
        comments_count: 23,
        caption: 'Dancing in the rain 💃',
      },
      {
        id: 3,
        media_url: '/api/placeholder/300/300',
        media_type: 'image',
        likes_count: 123,
        comments_count: 8,
        caption: 'Coffee time ☕',
      },
      {
        id: 4,
        media_url: '/api/placeholder/300/300',
        media_type: 'image',
        likes_count: 789,
        comments_count: 45,
        caption: 'New photoshoot! 📸',
      },
      {
        id: 5,
        media_url: '/api/placeholder/300/300',
        media_type: 'video',
        likes_count: 567,
        comments_count: 34,
        caption: 'Behind the scenes 🎬',
      },
      {
        id: 6,
        media_url: '/api/placeholder/300/300',
        media_type: 'image',
        likes_count: 345,
        comments_count: 19,
        caption: 'Golden hour magic ✨',
      },
    ];

    switch (activeTab) {
      case 0:
        setPosts(mockPosts);
        break;
      case 1:
        setSavedPosts(mockPosts.slice(0, 3));
        break;
      case 2:
        setTaggedPosts(mockPosts.slice(0, 2));
        break;
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleFollow = async () => {
    if (!profile) return;

    try {
      const method = profile.is_following ? 'DELETE' : 'POST';
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/${profile.id}/follow`,
        {
          method,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.ok) {
        setProfile(prev => prev ? {
          ...prev,
          is_following: !prev.is_following,
          followers_count: prev.is_following 
            ? prev.followers_count - 1 
            : prev.followers_count + 1
        } : null);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(prev => prev ? { ...prev, ...data.profile } : null);
        setEditDialogOpen(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const getCurrentPosts = () => {
    switch (activeTab) {
      case 0:
        return posts;
      case 1:
        return savedPosts;
      case 2:
        return taggedPosts;
      default:
        return posts;
    }
  };

  if (isLoading || !profile) {
    return (
      <ProfileContainer>
        <Header>
          <Typography variant="h6" sx={{ fontWeight: '600', color: '#262626' }}>
            Profile
          </Typography>
        </Header>
        <MainContent>
          <Box display="flex" justifyContent="center" alignItems="center" height="200px">
            <Typography>Loading profile...</Typography>
          </Box>
        </MainContent>
      </ProfileContainer>
    );
  }

  return (
    <ProfileContainer>
      <Header>
        <Typography variant="h6" sx={{ fontWeight: '600', color: '#262626' }}>
          {profile.username}
        </Typography>
        <IconButton>
          <Settings />
        </IconButton>
      </Header>

      <MainContent>
        {/* Profile Header */}
        <ProfileHeader>
          <ProfileAvatar src={profile.avatar} />
          
          <ProfileInfo>
            <UsernameRow>
              <Box display="flex" alignItems="center" gap={1}>
                <Username>{profile.username}</Username>
                {profile.is_verified && (
                  <Verified sx={{ color: '#0095f6', fontSize: 20 }} />
                )}
              </Box>
              
              {profile.is_own_profile ? (
                <EditButton onClick={() => setEditDialogOpen(true)}>
                  Edit profile
                </EditButton>
              ) : (
                <FollowButton onClick={handleFollow}>
                  {profile.is_following ? 'Unfollow' : 'Follow'}
                </FollowButton>
              )}
              
              <IconButton>
                <MoreVert />
              </IconButton>
            </UsernameRow>

            <StatsRow>
              <StatItem>
                <StatNumber>{profile.posts_count.toLocaleString()}</StatNumber>
                <StatLabel>posts</StatLabel>
              </StatItem>
              <StatItem>
                <StatNumber>{profile.followers_count.toLocaleString()}</StatNumber>
                <StatLabel>followers</StatLabel>
              </StatItem>
              <StatItem>
                <StatNumber>{profile.following_count.toLocaleString()}</StatNumber>
                <StatLabel>following</StatLabel>
              </StatItem>
            </StatsRow>

            <Box>
              <Bio sx={{ fontWeight: '600' }}>{profile.display_name}</Bio>
              {profile.bio && (
                <Bio sx={{ whiteSpace: 'pre-line' }}>{profile.bio}</Bio>
              )}
              {profile.website && (
                <BioLink>{profile.website}</BioLink>
              )}
            </Box>
          </ProfileInfo>
        </ProfileHeader>

        {/* Tabs */}
        <TabsContainer>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: '600',
                fontSize: '12px',
                color: '#8e8e8e',
                '&.Mui-selected': {
                  color: '#262626',
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#262626',
              },
            }}
          >
            <Tab icon={<GridOn />} label="POSTS" />
            <Tab icon={<BookmarkBorder />} label="SAVED" />
            <Tab icon={<PersonOutline />} label="TAGGED" />
          </Tabs>
        </TabsContainer>

        {/* Posts Grid */}
        <PostsGrid container spacing={1}>
          {getCurrentPosts().length === 0 ? (
            <Grid item xs={12}>
              <EmptyState>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {activeTab === 0 ? 'Share Photos' : activeTab === 1 ? 'Save Posts' : 'No Tagged Posts'}
                </Typography>
                <Typography variant="body2">
                  {activeTab === 0 
                    ? 'When you share photos, they will appear on your profile.'
                    : activeTab === 1
                    ? 'Save posts you want to see again.'
                    : 'When people tag you in photos, they\'ll appear here.'
                  }
                </Typography>
              </EmptyState>
            </Grid>
          ) : (
            getCurrentPosts().map((post) => (
              <Grid item xs={4} key={post.id}>
                <PostCard>
                  <CardMedia
                    component="img"
                    image={post.media_url}
                    alt="Post"
                    sx={{
                      aspectRatio: '1',
                      objectFit: 'cover',
                    }}
                  />
                  
                  <PostOverlay className="post-overlay">
                    <PostStats>
                      <Typography sx={{ mr: 2 }}>
                        ❤️ {post.likes_count.toLocaleString()}
                      </Typography>
                      <Typography>
                        💬 {post.comments_count}
                      </Typography>
                    </PostStats>
                  </PostOverlay>
                </PostCard>
              </Grid>
            ))
          )}
        </PostsGrid>
      </MainContent>

      {/* Edit Profile Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            value={editForm.display_name}
            onChange={(e) => setEditForm(prev => ({ ...prev, display_name: e.target.value }))}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Bio"
            multiline
            rows={4}
            value={editForm.bio}
            onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Website"
            value={editForm.website}
            onChange={(e) => setEditForm(prev => ({ ...prev, website: e.target.value }))}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveProfile}>Save</Button>
        </DialogActions>
      </Dialog>
    </ProfileContainer>
  );
};

export default ProfilePage;
