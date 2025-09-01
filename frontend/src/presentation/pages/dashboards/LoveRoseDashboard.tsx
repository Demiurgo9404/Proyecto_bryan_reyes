import React, { useState, useEffect } from 'react';
import { Box, Avatar, IconButton, Typography, Button, Paper } from '@mui/material';
import {
  Home,
  Search,
  Explore,
  VideoLibrary,
  Send,
  FavoriteBorder,
  Favorite,
  ChatBubbleOutline,
  Share,
  BookmarkBorder,
  MoreHoriz,
  Add
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Instagram-style styled components
const InstagramContainer = styled(Box)({
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

const Logo = styled(Typography)({
  fontSize: '24px',
  fontWeight: 'bold',
  fontFamily: 'Billabong, cursive',
  color: '#262626',
  cursor: 'pointer',
});

const SearchBar = styled('input')({
  width: '268px',
  height: '28px',
  padding: '3px 16px',
  backgroundColor: '#efefef',
  border: '1px solid #dbdbdb',
  borderRadius: '3px',
  fontSize: '14px',
  outline: 'none',
  '&::placeholder': {
    color: '#8e8e8e',
  },
});

const MainContent = styled(Box)({
  display: 'flex',
  maxWidth: '975px',
  margin: '0 auto',
  paddingTop: '84px',
  gap: '28px',
});

const LeftSidebar = styled(Box)({
  width: '244px',
  position: 'fixed',
  left: 'calc(50% - 487px)',
  top: '54px',
  height: 'calc(100vh - 54px)',
  padding: '20px 0',
  borderRight: '1px solid #dbdbdb',
  backgroundColor: '#ffffff',
});

const Feed = styled(Box)({
  width: '470px',
  margin: '0 auto',
});

const RightSidebar = styled(Box)({
  width: '293px',
  position: 'fixed',
  right: 'calc(50% - 487px)',
  top: '54px',
  height: 'calc(100vh - 54px)',
  padding: '20px 0',
});

const NavItem = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  padding: '12px 16px',
  cursor: 'pointer',
  borderRadius: '8px',
  margin: '0 12px 8px',
  '&:hover': {
    backgroundColor: '#f5f5f5',
  },
});

const NavIcon = styled(Box)({
  marginRight: '16px',
  fontSize: '24px',
});

const NavText = styled(Typography)({
  fontSize: '16px',
  fontWeight: '400',
  color: '#262626',
});

const StoriesContainer = styled(Box)({
  display: 'flex',
  gap: '14px',
  padding: '16px',
  backgroundColor: '#ffffff',
  border: '1px solid #dbdbdb',
  borderRadius: '3px',
  marginBottom: '24px',
  overflowX: 'auto',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
});

const StoryItem = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  minWidth: '66px',
  cursor: 'pointer',
});

const StoryAvatar = styled(Avatar)({
  width: '66px',
  height: '66px',
  background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
  padding: '2px',
});

const StoryAvatarInner = styled(Avatar)({
  width: '100%',
  height: '100%',
  border: '2px solid #ffffff',
});

const StoryUsername = styled(Typography)({
  fontSize: '12px',
  color: '#262626',
  marginTop: '4px',
  textAlign: 'center',
  maxWidth: '66px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

const PostCard = styled(Paper)({
  backgroundColor: '#ffffff',
  border: '1px solid #dbdbdb',
  borderRadius: '3px',
  marginBottom: '24px',
});

const PostHeader = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '14px 16px',
});

const PostUserInfo = styled(Box)({
  display: 'flex',
  alignItems: 'center',
});

const PostAvatar = styled(Avatar)({
  width: '32px',
  height: '32px',
  marginRight: '12px',
});

const PostUsername = styled(Typography)({
  fontSize: '14px',
  fontWeight: '600',
  color: '#262626',
});

const PostImage = styled('img')({
  width: '100%',
  height: 'auto',
  display: 'block',
});

const PostActions = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '6px 16px 8px',
});

const PostActionsLeft = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
});

const PostStats = styled(Box)({
  padding: '0 16px 8px',
});

const PostLikes = styled(Typography)({
  fontSize: '14px',
  fontWeight: '600',
  color: '#262626',
});

const PostCaption = styled(Box)({
  padding: '0 16px 8px',
});

const PostCaptionText = styled(Typography)({
  fontSize: '14px',
  color: '#262626',
  '& .username': {
    fontWeight: '600',
    marginRight: '4px',
  },
});

const PostComments = styled(Typography)({
  fontSize: '14px',
  color: '#8e8e8e',
  padding: '0 16px 8px',
  cursor: 'pointer',
});

const PostTime = styled(Typography)({
  fontSize: '10px',
  color: '#8e8e8e',
  textTransform: 'uppercase',
  letterSpacing: '0.2px',
  padding: '0 16px 16px',
});

const SuggestionsCard = styled(Paper)({
  backgroundColor: '#ffffff',
  border: '1px solid #dbdbdb',
  borderRadius: '3px',
  padding: '16px',
});

const SuggestionsHeader = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '16px',
});

const SuggestionsTitle = styled(Typography)({
  fontSize: '14px',
  fontWeight: '600',
  color: '#8e8e8e',
});

const SuggestionItem = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '12px',
  '&:last-child': {
    marginBottom: 0,
  },
});

const SuggestionUserInfo = styled(Box)({
  display: 'flex',
  alignItems: 'center',
});

const SuggestionAvatar = styled(Avatar)({
  width: '32px',
  height: '32px',
  marginRight: '12px',
});

const SuggestionUserDetails = styled(Box)({});

const SuggestionUsername = styled(Typography)({
  fontSize: '14px',
  fontWeight: '600',
  color: '#262626',
});

const SuggestionSubtext = styled(Typography)({
  fontSize: '12px',
  color: '#8e8e8e',
});

const FollowButton = styled(Button)({
  fontSize: '12px',
  fontWeight: '600',
  color: '#0095f6',
  textTransform: 'none',
  padding: 0,
  minWidth: 'auto',
  '&:hover': {
    backgroundColor: 'transparent',
  },
});

interface Post {
  id: string;
  username: string;
  avatar: string;
  image: string;
  likes: number;
  caption: string;
  comments: number;
  timeAgo: string;
  isLiked: boolean;
}

interface Story {
  id: string;
  username: string;
  avatar: string;
  hasStory: boolean;
}

interface Suggestion {
  id: string;
  username: string;
  avatar: string;
  subtext: string;
}

const LoveRoseDashboard: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [activeNav, setActiveNav] = useState('home');

  useEffect(() => {
    // Mock data
    setStories([
      { id: '1', username: 'Your Story', avatar: 'https://via.placeholder.com/66', hasStory: false },
      { id: '2', username: 'maria_model', avatar: 'https://via.placeholder.com/66', hasStory: true },
      { id: '3', username: 'sofia_rose', avatar: 'https://via.placeholder.com/66', hasStory: true },
      { id: '4', username: 'ana_beauty', avatar: 'https://via.placeholder.com/66', hasStory: true },
      { id: '5', username: 'lucia_cam', avatar: 'https://via.placeholder.com/66', hasStory: true },
    ]);

    setPosts([
      {
        id: '1',
        username: 'maria_model',
        avatar: 'https://via.placeholder.com/32',
        image: 'https://images.unsplash.com/photo-1494790108755-2616c9c0e0d5?w=470&h=470&fit=crop',
        likes: 734,
        caption: 'Beautiful sunset today! 🌅 #photography #nature',
        comments: 56,
        timeAgo: '2 hours ago',
        isLiked: false,
      },
      {
        id: '2',
        username: 'sofia_rose',
        avatar: 'https://via.placeholder.com/32',
        image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=470&h=600&fit=crop',
        likes: 1256,
        caption: 'New photoshoot vibes ✨ What do you think?',
        comments: 89,
        timeAgo: '5 hours ago',
        isLiked: true,
      },
    ]);

    setSuggestions([
      { id: '1', username: 'emma_style', avatar: 'https://via.placeholder.com/32', subtext: 'Followed by maria_model + 3 more' },
      { id: '2', username: 'alex_photo', avatar: 'https://via.placeholder.com/32', subtext: 'Suggested for you' },
      { id: '3', username: 'luna_cam', avatar: 'https://via.placeholder.com/32', subtext: 'Followed by sofia_rose' },
    ]);
  }, []);

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const navigationItems = [
    { id: 'home', icon: <Home />, text: 'Home' },
    { id: 'search', icon: <Search />, text: 'Search' },
    { id: 'explore', icon: <Explore />, text: 'Explore' },
    { id: 'reels', icon: <VideoLibrary />, text: 'Reels' },
    { id: 'messages', icon: <Send />, text: 'Messages' },
    { id: 'notifications', icon: <FavoriteBorder />, text: 'Notifications' },
    { id: 'create', icon: <Add />, text: 'Create' },
  ];

  return (
    <InstagramContainer>
      <Header>
        <Logo>LoveRose</Logo>
        <SearchBar placeholder="Search" />
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton><Home /></IconButton>
          <IconButton><Send /></IconButton>
          <IconButton><Add /></IconButton>
          <IconButton><Explore /></IconButton>
          <IconButton><FavoriteBorder /></IconButton>
          <Avatar sx={{ width: 24, height: 24 }} />
        </Box>
      </Header>

      <MainContent>
        <LeftSidebar>
          {navigationItems.map((item) => (
            <NavItem
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              sx={{
                backgroundColor: activeNav === item.id ? '#f5f5f5' : 'transparent',
              }}
            >
              <NavIcon>{item.icon}</NavIcon>
              <NavText>{item.text}</NavText>
            </NavItem>
          ))}
        </LeftSidebar>

        <Feed>
          {/* Stories */}
          <StoriesContainer>
            {stories.map((story) => (
              <StoryItem key={story.id}>
                <StoryAvatar>
                  <StoryAvatarInner src={story.avatar} />
                </StoryAvatar>
                <StoryUsername>{story.username}</StoryUsername>
              </StoryItem>
            ))}
          </StoriesContainer>

          {/* Posts */}
          {posts.map((post) => (
            <PostCard key={post.id} elevation={0}>
              <PostHeader>
                <PostUserInfo>
                  <PostAvatar src={post.avatar} />
                  <PostUsername>{post.username}</PostUsername>
                </PostUserInfo>
                <IconButton size="small">
                  <MoreHoriz />
                </IconButton>
              </PostHeader>

              <PostImage src={post.image} alt="Post" />

              <PostActions>
                <PostActionsLeft>
                  <IconButton onClick={() => handleLike(post.id)} sx={{ p: 0 }}>
                    {post.isLiked ? <Favorite sx={{ color: '#ed4956' }} /> : <FavoriteBorder />}
                  </IconButton>
                  <IconButton sx={{ p: 0 }}>
                    <ChatBubbleOutline />
                  </IconButton>
                  <IconButton sx={{ p: 0 }}>
                    <Share />
                  </IconButton>
                </PostActionsLeft>
                <IconButton sx={{ p: 0 }}>
                  <BookmarkBorder />
                </IconButton>
              </PostActions>

              <PostStats>
                <PostLikes>{post.likes.toLocaleString()} likes</PostLikes>
              </PostStats>

              <PostCaption>
                <PostCaptionText>
                  <span className="username">{post.username}</span>
                  {post.caption}
                </PostCaptionText>
              </PostCaption>

              <PostComments>
                View all {post.comments} comments
              </PostComments>

              <PostTime>{post.timeAgo}</PostTime>
            </PostCard>
          ))}
        </Feed>

        <RightSidebar>
          <SuggestionsCard elevation={0}>
            <SuggestionsHeader>
              <SuggestionsTitle>Suggestions For You</SuggestionsTitle>
              <Typography sx={{ fontSize: '12px', fontWeight: '600', color: '#262626', cursor: 'pointer' }}>
                See All
              </Typography>
            </SuggestionsHeader>

            {suggestions.map((suggestion) => (
              <SuggestionItem key={suggestion.id}>
                <SuggestionUserInfo>
                  <SuggestionAvatar src={suggestion.avatar} />
                  <SuggestionUserDetails>
                    <SuggestionUsername>{suggestion.username}</SuggestionUsername>
                    <SuggestionSubtext>{suggestion.subtext}</SuggestionSubtext>
                  </SuggestionUserDetails>
                </SuggestionUserInfo>
                <FollowButton>Follow</FollowButton>
              </SuggestionItem>
            ))}
          </SuggestionsCard>
        </RightSidebar>
      </MainContent>
    </InstagramContainer>
  );
};

export default LoveRoseDashboard;
