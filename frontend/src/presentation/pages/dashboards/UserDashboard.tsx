import React, { useEffect, useState } from 'react';
import {
  Box,
  Avatar,
  Typography,
  IconButton,
  Button,
  Card,
  CardContent,
  CardMedia,
  Divider,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge,
  Chip
} from '@mui/material';
import {
  Home,
  Search,
  Explore,
  VideoLibrary,
  Send,
  Notifications,
  Add,
  MoreHoriz,
  FavoriteBorder,
  Favorite,
  ChatBubbleOutline,
  Share,
  BookmarkBorder,
  Bookmark
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

// Interfaces
interface Story {
  id: string;
  username: string;
  avatar: string;
  isViewed: boolean;
  isOwn?: boolean;
}

interface Post {
  id: string;
  username: string;
  avatar: string;
  image: string;
  caption: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  isBookmarked: boolean;
  timeAgo: string;
  location?: string;
}

interface Suggestion {
  id: string;
  username: string;
  avatar: string;
  fullName: string;
  isFollowing: boolean;
  mutualFriends: number;
}

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [newPostCaption, setNewPostCaption] = useState('');
  const [newPostLocation, setNewPostLocation] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [commentInputs, setCommentInputs] = useState<{[key: string]: string}>({});

  const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    loadInstagramData();
  }, []);

  const loadInstagramData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Load stories, posts, and suggestions from backend
      const [storiesResponse, postsResponse, suggestionsResponse] = await Promise.all([
        fetch(`${apiURL}/stories`, { headers }),
        fetch(`${apiURL}/posts?limit=10`, { headers }),
        fetch(`${apiURL}/users/suggestions`, { headers })
      ]);

      // Handle stories
      if (storiesResponse.ok) {
        const storiesData = await storiesResponse.json();
        const formattedStories = storiesData.map((story: any) => ({
          id: story.id,
          username: story.is_own ? 'Tu historia' : story.username,
          avatar: story.avatar || '/default-avatar.jpg',
          isViewed: story.is_viewed,
          isOwn: story.is_own
        }));
        setStories(formattedStories);
      } else {
        // Fallback to mock data
        setStories([
          { id: '1', username: 'Tu historia', avatar: user?.avatar || '/default-avatar.jpg', isViewed: false, isOwn: true },
          { id: '2', username: 'sofia_model', avatar: '/avatars/sofia.jpg', isViewed: false },
          { id: '3', username: 'maria_rose', avatar: '/avatars/maria.jpg', isViewed: true },
          { id: '4', username: 'ana_bella', avatar: '/avatars/ana.jpg', isViewed: false },
          { id: '5', username: 'lucia_star', avatar: '/avatars/lucia.jpg', isViewed: true },
        ]);
      }

      // Handle posts
      if (postsResponse.ok) {
        const postsData = await postsResponse.json();
        const formattedPosts = postsData.map((post: any) => ({
          id: post.id,
          username: post.username,
          avatar: post.avatar || '/default-avatar.jpg',
          image: post.image || '/posts/default.jpg',
          caption: post.caption || '',
          likes: post.likes || 0,
          comments: post.comments || 0,
          isLiked: post.is_liked || false,
          isBookmarked: post.is_bookmarked || false,
          timeAgo: post.timeAgo || 'ahora',
          location: post.location
        }));
        setPosts(formattedPosts);
      } else {
        // Fallback to mock data
        setPosts([
          {
            id: '1',
            username: 'sofia_model',
            avatar: '/avatars/sofia.jpg',
            image: '/posts/post1.jpg',
            caption: '¡Nueva sesión disponible! ¿Quién quiere pasar un rato conmigo? #LoveRose #Live',
            likes: 73,
            comments: 12,
            isLiked: false,
            isBookmarked: false,
            timeAgo: '2 horas',
            location: 'Madrid, España'
          },
          {
            id: '2',
            username: 'maria_rose',
            avatar: '/avatars/maria.jpg',
            image: '/posts/post2.jpg',
            caption: 'Preparándome para la sesión de esta noche ¡Los espero!',
            likes: 156,
            comments: 28,
            isLiked: true,
            isBookmarked: true,
            timeAgo: '4 horas',
            location: 'Barcelona, España'
          }
        ]);
      }

      // Handle suggestions
      if (suggestionsResponse.ok) {
        const suggestionsData = await suggestionsResponse.json();
        const formattedSuggestions = suggestionsData.map((suggestion: any) => ({
          id: suggestion.id,
          username: suggestion.username,
          avatar: suggestion.avatar || '/default-avatar.jpg',
          fullName: suggestion.full_name || suggestion.username,
          isFollowing: suggestion.is_following || false,
          mutualFriends: suggestion.mutual_friends || 0
        }));
        setSuggestions(formattedSuggestions);
      } else {
        // Fallback to mock data
        setSuggestions([
          { id: '1', username: 'elena_vip', avatar: '/avatars/elena.jpg', fullName: 'Elena Martínez', isFollowing: false, mutualFriends: 3 },
          { id: '2', username: 'carla_premium', avatar: '/avatars/carla.jpg', fullName: 'Carla López', isFollowing: false, mutualFriends: 7 },
          { id: '3', username: 'natalia_exclusive', avatar: '/avatars/natalia.jpg', fullName: 'Natalia García', isFollowing: false, mutualFriends: 2 }
        ]);
      }

    } catch (error) {
      console.error('Error loading Instagram data:', error);
      // Set fallback mock data on error
      setStories([
        { id: '1', username: 'Tu historia', avatar: user?.avatar || '/default-avatar.jpg', isViewed: false, isOwn: true },
        { id: '2', username: 'sofia_model', avatar: '/avatars/sofia.jpg', isViewed: false },
        { id: '3', username: 'maria_rose', avatar: '/avatars/maria.jpg', isViewed: true },
      ]);

      setPosts([
        {
          id: '1',
          username: 'sofia_model',
          avatar: '/avatars/sofia.jpg',
          image: '/posts/post1.jpg',
          caption: '¡Nueva sesión disponible! ¿Quién quiere pasar un rato conmigo? #LoveRose #Live',
          likes: 73,
          comments: 12,
          isLiked: false,
          isBookmarked: false,
          timeAgo: '2 horas',
          location: 'Madrid, España'
        }
      ]);

      setSuggestions([
        { id: '1', username: 'elena_vip', avatar: '/avatars/elena.jpg', fullName: 'Elena Martínez', isFollowing: false, mutualFriends: 3 }
      ]);
    }

    setLoading(false);
  };

  const handleLike = async (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    // Optimistic update
    setPosts(posts.map(p => 
      p.id === postId 
        ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
        : p
    ));

    try {
      const token = localStorage.getItem('token');
      const method = post.isLiked ? 'DELETE' : 'POST';
      
      await fetch(`${apiURL}/posts/${postId}/like`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Error updating like:', error);
      // Revert optimistic update on error
      setPosts(posts.map(p => 
        p.id === postId 
          ? { ...p, isLiked: post.isLiked, likes: post.likes }
          : p
      ));
    }
  };

  const handleBookmark = async (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    // Optimistic update
    setPosts(posts.map(p => 
      p.id === postId 
        ? { ...p, isBookmarked: !p.isBookmarked }
        : p
    ));

    try {
      const token = localStorage.getItem('token');
      const method = post.isBookmarked ? 'DELETE' : 'POST';
      
      await fetch(`${apiURL}/posts/${postId}/bookmark`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Error updating bookmark:', error);
      // Revert optimistic update on error
      setPosts(posts.map(p => 
        p.id === postId 
          ? { ...p, isBookmarked: post.isBookmarked }
          : p
      ));
    }
  };

  const handleFollow = async (suggestionId: string) => {
    const suggestion = suggestions.find(s => s.id === suggestionId);
    if (!suggestion) return;

    // Optimistic update
    setSuggestions(suggestions.map(s =>
      s.id === suggestionId
        ? { ...s, isFollowing: !s.isFollowing }
        : s
    ));

    try {
      const token = localStorage.getItem('token');
      const method = suggestion.isFollowing ? 'DELETE' : 'POST';
      
      await fetch(`${apiURL}/users/${suggestionId}/follow`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Error updating follow:', error);
      // Revert optimistic update on error
      setSuggestions(suggestions.map(s =>
        s.id === suggestionId
          ? { ...s, isFollowing: suggestion.isFollowing }
          : s
      ));
    }
  };

  const handleCreatePost = async () => {
    if (!newPostCaption.trim() && selectedFiles.length === 0) {
      return;
    }

    setIsCreatingPost(true);
    
    try {
      const token = localStorage.getItem('token');
      
      // For now, we'll use mock image URLs since we don't have file upload setup
      const mockImageUrls = selectedFiles.length > 0 
        ? ['/posts/user-post.jpg'] 
        : [];

      const response = await fetch(`${apiURL}/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          caption: newPostCaption.trim(),
          location: newPostLocation.trim() || null,
          mediaUrls: mockImageUrls
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Add the new post to the beginning of the posts array
        if (result.post) {
          setPosts([result.post, ...posts]);
        }

        // Reset form
        setNewPostCaption('');
        setNewPostLocation('');
        setSelectedFiles([]);
        setPreviewUrls([]);
        setOpenCreateDialog(false);
      } else {
        console.error('Error creating post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsCreatingPost(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Limit to 10 files
    const limitedFiles = files.slice(0, 10);
    setSelectedFiles(limitedFiles);

    // Create preview URLs
    const urls = limitedFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newUrls = previewUrls.filter((_, i) => i !== index);
    
    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(previewUrls[index]);
    
    setSelectedFiles(newFiles);
    setPreviewUrls(newUrls);
  };

  const handleAddComment = async (postId: string) => {
    const comment = commentInputs[postId]?.trim();
    if (!comment) return;

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${apiURL}/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ comment })
      });

      if (response.ok) {
        // Update the comment count for the post
        setPosts(posts.map(post => 
          post.id === postId 
            ? { ...post, comments: post.comments + 1 }
            : post
        ));

        // Clear the comment input
        setCommentInputs({ ...commentInputs, [postId]: '' });
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleCommentInputChange = (postId: string, value: string) => {
    setCommentInputs({ ...commentInputs, [postId]: value });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography>Cargando...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      backgroundColor: '#fafafa',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    }}>
      {/* Navigation Bar */}
      <Box sx={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        backgroundColor: 'white',
        borderBottom: '1px solid #dbdbdb',
        px: 2,
        py: 1
      }}>
        <Box sx={{ 
          maxWidth: '975px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Logo */}
          <Typography variant="h5" sx={{ 
            fontFamily: 'Billabong, cursive',
            fontSize: '28px',
            color: '#262626',
            fontWeight: 400
          }}>
            LoveRose
          </Typography>

          {/* Search Bar */}
          <Box sx={{ 
            display: { xs: 'none', md: 'block' },
            backgroundColor: '#efefef',
            borderRadius: '8px',
            px: 2,
            py: 1,
            minWidth: '268px'
          }}>
            <Box display="flex" alignItems="center">
              <Search sx={{ color: '#8e8e8e', mr: 1, fontSize: '16px' }} />
              <Typography sx={{ color: '#8e8e8e', fontSize: '14px' }}>
                Buscar
              </Typography>
            </Box>
          </Box>

          {/* Navigation Icons */}
          <Box display="flex" alignItems="center" gap={2}>
            <IconButton sx={{ color: '#262626' }}>
              <Home />
            </IconButton>
            <IconButton sx={{ color: '#262626', display: { xs: 'block', md: 'none' } }}>
              <Search />
            </IconButton>
            <IconButton sx={{ color: '#262626' }}>
              <Explore />
            </IconButton>
            <IconButton sx={{ color: '#262626' }}>
              <VideoLibrary />
            </IconButton>
            <IconButton sx={{ color: '#262626' }}>
              <Send />
            </IconButton>
            <IconButton sx={{ color: '#262626' }}>
              <Badge badgeContent={3} color="error">
                <Notifications />
              </Badge>
            </IconButton>
            <IconButton 
              sx={{ color: '#262626' }}
              onClick={() => setOpenCreateDialog(true)}
            >
              <Add />
            </IconButton>
            <Avatar 
              src={user?.avatar} 
              alt={user?.username}
              sx={{ width: 24, height: 24, cursor: 'pointer' }}
            />
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ 
        pt: '60px',
        maxWidth: '975px',
        margin: '0 auto',
        display: 'flex',
        gap: 4,
        px: 2
      }}>
        {/* Left Column - Stories and Feed */}
        <Box sx={{ flex: 1, maxWidth: '614px' }}>
          {/* Stories Section */}
          <Card sx={{ 
            mb: 3,
            border: '1px solid #dbdbdb',
            borderRadius: '8px',
            backgroundColor: 'white'
          }}>
            <CardContent sx={{ py: 2 }}>
              <Box sx={{ 
                display: 'flex',
                gap: 2,
                overflowX: 'auto',
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': { display: 'none' }
              }}>
                {stories.map((story) => (
                  <Box key={story.id} sx={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    minWidth: '66px',
                    cursor: 'pointer'
                  }}>
                    <Box sx={{ 
                      position: 'relative',
                      mb: 1
                    }}>
                      <Avatar
                        src={story.avatar}
                        alt={story.username}
                        sx={{
                          width: 56,
                          height: 56,
                          border: story.isViewed ? '2px solid #c7c7c7' : '2px solid #e91e63',
                          padding: '2px'
                        }}
                      />
                      {story.isOwn && (
                        <Box sx={{
                          position: 'absolute',
                          bottom: -2,
                          right: -2,
                          backgroundColor: '#0095f6',
                          borderRadius: '50%',
                          width: 20,
                          height: 20,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '2px solid white'
                        }}>
                          <Add sx={{ color: 'white', fontSize: 12 }} />
                        </Box>
                      )}
                    </Box>
                    <Typography sx={{ 
                      fontSize: '12px',
                      color: '#262626',
                      textAlign: 'center',
                      maxWidth: '66px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {story.username}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Posts Feed */}
          {posts.map((post) => (
            <Card key={post.id} sx={{ 
              mb: 3,
              border: '1px solid #dbdbdb',
              borderRadius: '8px',
              backgroundColor: 'white'
            }}>
              {/* Post Header */}
              <Box sx={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 2
              }}>
                <Box display="flex" alignItems="center">
                  <Avatar 
                    src={post.avatar}
                    alt={post.username}
                    sx={{ width: 32, height: 32, mr: 1.5 }}
                  />
                  <Box>
                    <Typography sx={{ 
                      fontWeight: 600,
                      fontSize: '14px',
                      color: '#262626'
                    }}>
                      {post.username}
                    </Typography>
                    {post.location && (
                      <Typography sx={{ 
                        fontSize: '12px',
                        color: '#8e8e8e'
                      }}>
                        {post.location}
                      </Typography>
                    )}
                  </Box>
                </Box>
                <IconButton size="small">
                  <MoreHoriz />
                </IconButton>
              </Box>

              {/* Post Image */}
              <CardMedia
                component="img"
                image={post.image}
                alt="Post"
                sx={{ 
                  width: '100%',
                  maxHeight: '614px',
                  objectFit: 'cover'
                }}
              />

              {/* Post Actions */}
              <Box sx={{ p: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Box display="flex" gap={1}>
                    <IconButton 
                      size="small"
                      onClick={() => handleLike(post.id)}
                      sx={{ p: 0.5 }}
                    >
                      {post.isLiked ? 
                        <Favorite sx={{ color: '#ed4956', fontSize: '24px' }} /> :
                        <FavoriteBorder sx={{ fontSize: '24px' }} />
                      }
                    </IconButton>
                    <IconButton size="small" sx={{ p: 0.5 }}>
                      <ChatBubbleOutline sx={{ fontSize: '24px' }} />
                    </IconButton>
                    <IconButton size="small" sx={{ p: 0.5 }}>
                      <Send sx={{ fontSize: '24px' }} />
                    </IconButton>
                  </Box>
                  <IconButton 
                    size="small"
                    onClick={() => handleBookmark(post.id)}
                    sx={{ p: 0.5 }}
                  >
                    {post.isBookmarked ? 
                      <Bookmark sx={{ fontSize: '24px' }} /> :
                      <BookmarkBorder sx={{ fontSize: '24px' }} />
                    }
                  </IconButton>
                </Box>

                {/* Likes Count */}
                <Typography sx={{ 
                  fontWeight: 600,
                  fontSize: '14px',
                  color: '#262626',
                  mb: 1
                }}>
                  {post.likes} Me gusta
                </Typography>

                {/* Caption */}
                <Typography sx={{ 
                  fontSize: '14px',
                  color: '#262626',
                  mb: 1
                }}>
                  <strong>{post.username}</strong> {post.caption}
                </Typography>

                {/* Comments */}
                <Typography sx={{ 
                  fontSize: '14px',
                  color: '#8e8e8e',
                  mb: 1,
                  cursor: 'pointer'
                }}>
                  Ver los {post.comments} comentarios
                </Typography>

                {/* Time */}
                <Typography sx={{ 
                  fontSize: '10px',
                  color: '#8e8e8e',
                  textTransform: 'uppercase',
                  letterSpacing: '0.2px'
                }}>
                  Hace {post.timeAgo}
                </Typography>
              </Box>

              <Divider />

              {/* Add Comment */}
              <Box sx={{ 
                display: 'flex',
                alignItems: 'center',
                p: { xs: 1.5, sm: 2 }
              }}>
                <TextField
                  placeholder="Agrega un comentario..."
                  variant="standard"
                  fullWidth
                  value={commentInputs[post.id] || ''}
                  onChange={(e) => handleCommentInputChange(post.id, e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddComment(post.id);
                    }
                  }}
                  InputProps={{
                    disableUnderline: true,
                    sx: { fontSize: { xs: '13px', sm: '14px' } }
                  }}
                />
                <Button 
                  onClick={() => handleAddComment(post.id)}
                  disabled={!commentInputs[post.id]?.trim()}
                  sx={{ 
                    color: commentInputs[post.id]?.trim() ? '#0095f6' : '#c7c7c7',
                    fontWeight: 600,
                    fontSize: { xs: '13px', sm: '14px' },
                    textTransform: 'none',
                    minWidth: 'auto'
                  }}
                >
                  Publicar
                </Button>
              </Box>
            </Card>
          ))}
        </Box>

        {/* Right Sidebar */}
        <Box sx={{ 
          width: '293px',
          display: { xs: 'none', lg: 'block' },
          position: 'sticky',
          top: '84px',
          height: 'fit-content'
        }}>
          {/* User Profile */}
          <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
            <Box display="flex" alignItems="center">
              <Avatar 
                src={user?.avatar}
                alt={user?.username}
                sx={{ width: 56, height: 56, mr: 2 }}
              />
              <Box>
                <Typography sx={{ 
                  fontWeight: 600,
                  fontSize: '14px',
                  color: '#262626'
                }}>
                  {user?.username}
                </Typography>
                <Typography sx={{ 
                  fontSize: '14px',
                  color: '#8e8e8e'
                }}>
                  {user?.firstName} {user?.lastName}
                </Typography>
                <Chip 
                  label="Usuario" 
                  size="small" 
                  sx={{ 
                    backgroundColor: '#e3f2fd',
                    color: '#1976d2',
                    fontSize: '10px',
                    height: '20px',
                    mt: 0.5
                  }} 
                />
              </Box>
            </Box>
            <Button sx={{ 
              color: '#0095f6',
              fontWeight: 600,
              fontSize: '12px',
              textTransform: 'none'
            }}>
              Cambiar
            </Button>
          </Box>

          {/* Suggestions */}
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography sx={{ 
                fontWeight: 600,
                fontSize: '14px',
                color: '#8e8e8e'
              }}>
                Sugerencias para ti
              </Typography>
              <Button sx={{ 
                color: '#262626',
                fontWeight: 600,
                fontSize: '12px',
                textTransform: 'none'
              }}>
                Ver todo
              </Button>
            </Box>

            {suggestions.map((suggestion) => (
              <Box key={suggestion.id} display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Box display="flex" alignItems="center">
                  <Avatar 
                    src={suggestion.avatar}
                    alt={suggestion.username}
                    sx={{ width: 32, height: 32, mr: 1.5 }}
                  />
                  <Box>
                    <Typography sx={{ 
                      fontWeight: 600,
                      fontSize: '14px',
                      color: '#262626'
                    }}>
                      {suggestion.username}
                    </Typography>
                    <Typography sx={{ 
                      fontSize: '12px',
                      color: '#8e8e8e'
                    }}>
                      {suggestion.mutualFriends} amigos en común
                    </Typography>
                  </Box>
                </Box>
                <Button 
                  onClick={() => handleFollow(suggestion.id)}
                  sx={{ 
                    color: suggestion.isFollowing ? '#8e8e8e' : '#0095f6',
                    fontWeight: 600,
                    fontSize: '12px',
                    textTransform: 'none',
                    minWidth: 'auto'
                  }}
                >
                  {suggestion.isFollowing ? 'Siguiendo' : 'Seguir'}
                </Button>
              </Box>
            ))}
          </Box>

          {/* Supplements Section */}
          <Box sx={{ mt: 4 }}>
            <Typography sx={{ 
              fontWeight: 600,
              fontSize: '14px',
              color: '#8e8e8e',
              mb: 2
            }}>
              Contenido Patrocinado
            </Typography>
            <Card sx={{ 
              border: '1px solid #dbdbdb',
              borderRadius: '8px',
              p: 2
            }}>
              <Typography sx={{ 
                fontSize: '12px',
                color: '#262626',
                mb: 1
              }}>
                Sesiones Premium Disponibles
              </Typography>
              <Typography sx={{ 
                fontSize: '11px',
                color: '#8e8e8e'
              }}>
                Descubre modelos exclusivas y experiencias únicas
              </Typography>
            </Card>
          </Box>
        </Box>
      </Box>

      {/* Create Post Dialog */}
      <Dialog 
        open={openCreateDialog} 
        onClose={() => setOpenCreateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center', borderBottom: '1px solid #dbdbdb' }}>
          Crear nueva publicación
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          {/* File Upload Area */}
          <Box sx={{ 
            border: '2px dashed #dbdbdb',
            borderRadius: '8px',
            p: { xs: 3, sm: 4 },
            textAlign: 'center',
            mb: 2,
            position: 'relative',
            cursor: 'pointer',
            '&:hover': {
              borderColor: '#0095f6',
              backgroundColor: '#f8f9fa'
            }
          }}
          onClick={() => document.getElementById('file-input')?.click()}
          >
            <input
              id="file-input"
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            
            {previewUrls.length > 0 ? (
              <Box>
                <Box sx={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: 1, 
                  justifyContent: 'center',
                  mb: 2 
                }}>
                  {previewUrls.map((url, index) => (
                    <Box key={index} sx={{ position: 'relative' }}>
                      <img 
                        src={url} 
                        alt={`Preview ${index + 1}`}
                        style={{ 
                          width: '80px', 
                          height: '80px', 
                          objectFit: 'cover', 
                          borderRadius: '8px' 
                        }}
                      />
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(index);
                        }}
                        sx={{
                          position: 'absolute',
                          top: -8,
                          right: -8,
                          backgroundColor: 'rgba(0,0,0,0.7)',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: 'rgba(0,0,0,0.9)'
                          }
                        }}
                      >
                        ×
                      </IconButton>
                    </Box>
                  ))}
                </Box>
                <Typography sx={{ 
                  color: '#0095f6',
                  fontSize: { xs: '13px', sm: '14px' },
                  fontWeight: 500
                }}>
                  {selectedFiles.length} archivo(s) seleccionado(s). Haz clic para cambiar.
                </Typography>
              </Box>
            ) : (
              <Box>
                <Add sx={{ fontSize: { xs: '40px', sm: '48px' }, color: '#8e8e8e', mb: 1 }} />
                <Typography sx={{ 
                  color: '#8e8e8e',
                  fontSize: { xs: '13px', sm: '14px' }
                }}>
                  Arrastra fotos y videos aquí o haz clic para seleccionar
                </Typography>
              </Box>
            )}
          </Box>

          {/* Caption Input */}
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Escribe una descripción..."
            variant="outlined"
            value={newPostCaption}
            onChange={(e) => setNewPostCaption(e.target.value)}
            sx={{ 
              mb: 2,
              '& .MuiInputBase-input': {
                fontSize: { xs: '13px', sm: '14px' }
              }
            }}
          />

          {/* Location Input */}
          <TextField
            fullWidth
            placeholder="Agregar ubicación..."
            variant="outlined"
            value={newPostLocation}
            onChange={(e) => setNewPostLocation(e.target.value)}
            sx={{ 
              '& .MuiInputBase-input': {
                fontSize: { xs: '13px', sm: '14px' }
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ 
          p: { xs: 1.5, sm: 2 }, 
          borderTop: '1px solid #dbdbdb',
          gap: { xs: 1, sm: 0 }
        }}>
          <Button 
            onClick={() => {
              setOpenCreateDialog(false);
              setNewPostCaption('');
              setNewPostLocation('');
              setSelectedFiles([]);
              setPreviewUrls([]);
            }}
            sx={{ fontSize: { xs: '13px', sm: '14px' } }}
            disabled={isCreatingPost}
          >
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            onClick={handleCreatePost}
            disabled={isCreatingPost || (!newPostCaption.trim() && selectedFiles.length === 0)}
            sx={{ 
              backgroundColor: '#0095f6',
              '&:hover': { backgroundColor: '#1877f2' },
              fontSize: { xs: '13px', sm: '14px' },
              '&:disabled': {
                backgroundColor: '#c7c7c7'
              }
            }}
          >
            {isCreatingPost ? 'Compartiendo...' : 'Compartir'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserDashboard;
