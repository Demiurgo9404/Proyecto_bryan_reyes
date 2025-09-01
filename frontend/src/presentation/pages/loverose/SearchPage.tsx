import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Avatar,
  Button,
  Tabs,
  Tab,
  Grid,
  Card,
  CardMedia,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear,
  Person,
  Tag,
  LocationOn,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../../contexts/AuthContext';

const SearchContainer = styled(Box)({
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
  padding: '0 20px',
  zIndex: 1000,
});

const SearchInput = styled(TextField)({
  flex: 1,
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#efefef',
    borderRadius: '8px',
    fontSize: '14px',
    '& fieldset': {
      border: 'none',
    },
    '&:hover fieldset': {
      border: 'none',
    },
    '&.Mui-focused fieldset': {
      border: '1px solid #0095f6',
    },
  },
  '& .MuiOutlinedInput-input': {
    padding: '8px 12px',
  },
});

const ContentArea = styled(Box)({
  marginTop: '54px',
  minHeight: 'calc(100vh - 54px)',
});

const TabsContainer = styled(Box)({
  backgroundColor: '#ffffff',
  borderBottom: '1px solid #dbdbdb',
  position: 'sticky',
  top: '54px',
  zIndex: 999,
});

const StyledTabs = styled(Tabs)({
  '& .MuiTab-root': {
    textTransform: 'none',
    fontSize: '14px',
    fontWeight: '600',
    color: '#8e8e8e',
    minWidth: 'auto',
    padding: '12px 16px',
  },
  '& .Mui-selected': {
    color: '#262626',
  },
  '& .MuiTabs-indicator': {
    backgroundColor: '#262626',
    height: '1px',
  },
});

const ResultsContainer = styled(Box)({
  padding: '20px',
});

const RecentSearches = styled(Box)({
  backgroundColor: '#ffffff',
  padding: '16px 20px',
  borderBottom: '1px solid #dbdbdb',
});

const RecentSearchItem = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '8px 0',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: '#fafafa',
  },
});

const UserResult = styled(ListItem)({
  padding: '8px 0',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: '#fafafa',
  },
});

const PostGrid = styled(Grid)({
  marginTop: '8px',
});

const PostCard = styled(Card)({
  aspectRatio: '1',
  cursor: 'pointer',
  position: 'relative',
  '&:hover': {
    '& .overlay': {
      opacity: 1,
    },
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
  transition: 'opacity 0.2s',
  color: '#ffffff',
  fontWeight: '600',
});

const HashtagItem = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  padding: '12px 0',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: '#fafafa',
  },
});

const PlaceItem = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  padding: '12px 0',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: '#fafafa',
  },
});

const SearchPage: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [searchResults, setSearchResults] = useState({
    users: [],
    posts: [],
    hashtags: [],
    places: [],
  });
  const [recentSearches, setRecentSearches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (searchQuery.trim()) {
      handleSearch();
    } else {
      loadRecentSearches();
    }
  }, [searchQuery, activeTab]);

  const loadRecentSearches = async () => {
    // Mock recent searches
    const mockRecentSearches = [
      { id: 1, type: 'user', query: 'maria_model', avatar: '/api/placeholder/32/32' },
      { id: 2, type: 'hashtag', query: '#sunset' },
      { id: 3, type: 'user', query: 'sofia_rose', avatar: '/api/placeholder/32/32' },
      { id: 4, type: 'hashtag', query: '#photography' },
      { id: 5, type: 'place', query: 'Miami Beach' },
    ];
    setRecentSearches(mockRecentSearches);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/search?q=${encodeURIComponent(searchQuery)}&type=${getSearchType()}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      } else {
        // Load mock data
        loadMockSearchResults();
      }
    } catch (error) {
      console.error('Error searching:', error);
      loadMockSearchResults();
    } finally {
      setIsLoading(false);
    }
  };

  const loadMockSearchResults = () => {
    const mockResults = {
      users: [
        {
          id: 1,
          username: 'maria_model',
          display_name: 'Maria Rodriguez',
          avatar: '/api/placeholder/32/32',
          is_verified: true,
          followers_count: 15420,
          is_following: false,
        },
        {
          id: 2,
          username: 'sofia_rose',
          display_name: 'Sofia Rose',
          avatar: '/api/placeholder/32/32',
          is_verified: false,
          followers_count: 8932,
          is_following: true,
        },
      ],
      posts: [
        {
          id: 1,
          media_url: '/api/placeholder/300/300',
          likes_count: 1234,
          comments_count: 56,
        },
        {
          id: 2,
          media_url: '/api/placeholder/300/300',
          likes_count: 892,
          comments_count: 23,
        },
      ],
      hashtags: [
        {
          name: 'sunset',
          posts_count: 125420,
        },
        {
          name: 'photography',
          posts_count: 89432,
        },
      ],
      places: [
        {
          id: 1,
          name: 'Miami Beach',
          location: 'Miami, Florida',
          posts_count: 45230,
        },
        {
          id: 2,
          name: 'South Beach',
          location: 'Miami Beach, Florida',
          posts_count: 23410,
        },
      ],
    };
    setSearchResults(mockResults);
  };

  const getSearchType = () => {
    switch (activeTab) {
      case 0: return 'all';
      case 1: return 'users';
      case 2: return 'hashtags';
      case 3: return 'places';
      default: return 'all';
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults({ users: [], posts: [], hashtags: [], places: [] });
  };

  const handleFollow = async (userId: number, isFollowing: boolean) => {
    try {
      const method = isFollowing ? 'DELETE' : 'POST';
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/${userId}/follow`,
        {
          method,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.ok) {
        setSearchResults(prev => ({
          ...prev,
          users: prev.users.map(user =>
            user.id === userId ? { ...user, is_following: !isFollowing } : user
          ),
        }));
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const renderRecentSearches = () => (
    <RecentSearches>
      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: '600', color: '#262626' }}>
        Recent
      </Typography>
      {recentSearches.map((search) => (
        <RecentSearchItem key={search.id} onClick={() => setSearchQuery(search.query)}>
          <Box display="flex" alignItems="center">
            {search.type === 'user' ? (
              <Avatar src={search.avatar} sx={{ width: 32, height: 32, mr: 2 }} />
            ) : search.type === 'hashtag' ? (
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  backgroundColor: '#efefef',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2,
                }}
              >
                <Tag sx={{ fontSize: 16 }} />
              </Box>
            ) : (
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  backgroundColor: '#efefef',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2,
                }}
              >
                <LocationOn sx={{ fontSize: 16 }} />
              </Box>
            )}
            <Typography variant="body2" color="#262626">
              {search.query}
            </Typography>
          </Box>
          <Clear sx={{ fontSize: 16, color: '#8e8e8e' }} />
        </RecentSearchItem>
      ))}
    </RecentSearches>
  );

  const renderUsers = () => (
    <List>
      {searchResults.users.map((user) => (
        <UserResult key={user.id}>
          <ListItemAvatar>
            <Avatar src={user.avatar} />
          </ListItemAvatar>
          <ListItemText
            primary={
              <Box display="flex" alignItems="center">
                <Typography variant="body2" fontWeight="600">
                  {user.username}
                </Typography>
                {user.is_verified && (
                  <span style={{ color: '#0095f6', marginLeft: '4px' }}>✓</span>
                )}
              </Box>
            }
            secondary={
              <Box>
                <Typography variant="body2" color="textSecondary">
                  {user.display_name}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {user.followers_count.toLocaleString()} followers
                </Typography>
              </Box>
            }
          />
          <ListItemSecondaryAction>
            <Button
              variant={user.is_following ? 'outlined' : 'contained'}
              size="small"
              onClick={() => handleFollow(user.id, user.is_following)}
              sx={{
                textTransform: 'none',
                fontWeight: '600',
                fontSize: '12px',
                ...(user.is_following
                  ? { color: '#262626', borderColor: '#dbdbdb' }
                  : { backgroundColor: '#0095f6', '&:hover': { backgroundColor: '#1877f2' } }),
              }}
            >
              {user.is_following ? 'Following' : 'Follow'}
            </Button>
          </ListItemSecondaryAction>
        </UserResult>
      ))}
    </List>
  );

  const renderPosts = () => (
    <PostGrid container spacing={1}>
      {searchResults.posts.map((post) => (
        <Grid item xs={4} key={post.id}>
          <PostCard>
            <CardMedia
              component="img"
              image={post.media_url}
              alt="Post"
              sx={{ height: '100%', objectFit: 'cover' }}
            />
            <PostOverlay className="overlay">
              <Box display="flex" alignItems="center" gap={2}>
                <Box display="flex" alignItems="center">
                  <Typography variant="body2" sx={{ mr: 0.5 }}>
                    ❤️
                  </Typography>
                  <Typography variant="body2">
                    {post.likes_count.toLocaleString()}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center">
                  <Typography variant="body2" sx={{ mr: 0.5 }}>
                    💬
                  </Typography>
                  <Typography variant="body2">
                    {post.comments_count}
                  </Typography>
                </Box>
              </Box>
            </PostOverlay>
          </PostCard>
        </Grid>
      ))}
    </PostGrid>
  );

  const renderHashtags = () => (
    <List>
      {searchResults.hashtags.map((hashtag) => (
        <HashtagItem key={hashtag.name}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              backgroundColor: '#efefef',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2,
            }}
          >
            <Tag />
          </Box>
          <Box>
            <Typography variant="body2" fontWeight="600">
              #{hashtag.name}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {hashtag.posts_count.toLocaleString()} posts
            </Typography>
          </Box>
        </HashtagItem>
      ))}
    </List>
  );

  const renderPlaces = () => (
    <List>
      {searchResults.places.map((place) => (
        <PlaceItem key={place.id}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              backgroundColor: '#efefef',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2,
            }}
          >
            <LocationOn />
          </Box>
          <Box>
            <Typography variant="body2" fontWeight="600">
              {place.name}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {place.location} • {place.posts_count.toLocaleString()} posts
            </Typography>
          </Box>
        </PlaceItem>
      ))}
    </List>
  );

  const renderTabContent = () => {
    if (!searchQuery.trim()) {
      return renderRecentSearches();
    }

    switch (activeTab) {
      case 0: // All
        return (
          <Box>
            {searchResults.users.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: '600', px: 2 }}>
                  Accounts
                </Typography>
                {renderUsers()}
              </Box>
            )}
            {searchResults.posts.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: '600', px: 2 }}>
                  Posts
                </Typography>
                <Box sx={{ px: 2 }}>
                  {renderPosts()}
                </Box>
              </Box>
            )}
          </Box>
        );
      case 1: // Users
        return renderUsers();
      case 2: // Hashtags
        return renderHashtags();
      case 3: // Places
        return renderPlaces();
      default:
        return null;
    }
  };

  return (
    <SearchContainer>
      <Header>
        <SearchInput
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#8e8e8e', fontSize: 16 }} />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <Clear
                  sx={{ color: '#8e8e8e', fontSize: 16, cursor: 'pointer' }}
                  onClick={handleClearSearch}
                />
              </InputAdornment>
            ),
          }}
        />
      </Header>

      <ContentArea>
        {searchQuery.trim() && (
          <TabsContainer>
            <StyledTabs value={activeTab} onChange={handleTabChange}>
              <Tab label="All" />
              <Tab label="Accounts" />
              <Tab label="Tags" />
              <Tab label="Places" />
            </StyledTabs>
          </TabsContainer>
        )}

        <ResultsContainer>
          {renderTabContent()}
        </ResultsContainer>
      </ContentArea>
    </SearchContainer>
  );
};

export default SearchPage;
