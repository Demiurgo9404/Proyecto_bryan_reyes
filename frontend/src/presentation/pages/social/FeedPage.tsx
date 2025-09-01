import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  CircularProgress,
  Chip,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Add,
  Favorite,
  FavoriteBorder,
  Comment,
  Share,
  MoreVert,
  PhotoCamera,
  Videocam,
  LocationOn,
  EmojiEmotions
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface Post {
  id: string;
  userId: string;
  user: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    isVerified: boolean;
  };
  caption?: string;
  location?: string;
  media: Array<{
    id: string;
    url: string;
    type: 'image' | 'video';
    thumbnailUrl?: string;
  }>;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked: boolean;
  createdAt: string;
  type: 'photo' | 'video' | 'carousel' | 'text' | 'reel';
}

interface CreatePostData {
  caption: string;
  location: string;
  media: File[];
  type: 'photo' | 'video' | 'text';
}

const FeedPage: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [openCreatePost, setOpenCreatePost] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  
  const [newPost, setNewPost] = useState<CreatePostData>({
    caption: '',
    location: '',
    media: [],
    type: 'photo'
  });

  // Cargar posts iniciales
  useEffect(() => {
    fetchPosts(1);
  }, []);

  const fetchPosts = async (pageNum: number) => {
    try {
      const response = await fetch(`/api/posts/feed?page=${pageNum}&limit=10`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      
      if (pageNum === 1) {
        setPosts(data.posts);
      } else {
        setPosts(prev => [...prev, ...data.posts]);
      }
      
      setHasMore(data.hasMore);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMorePosts = () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      fetchPosts(page + 1);
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                isLiked: !post.isLiked,
                likesCount: post.isLiked ? post.likesCount - 1 : post.likesCount + 1
              }
            : post
        ));
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleCreatePost = async () => {
    try {
      const formData = new FormData();
      formData.append('caption', newPost.caption);
      formData.append('location', newPost.location);
      formData.append('type', newPost.type);
      
      newPost.media.forEach((file, index) => {
        formData.append(`media_${index}`, file);
      });

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });

      if (response.ok) {
        const newPostData = await response.json();
        setPosts(prev => [newPostData, ...prev]);
        setOpenCreatePost(false);
        setNewPost({ caption: '', location: '', media: [], type: 'photo' });
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setNewPost(prev => ({ ...prev, media: files }));
  };

  const PostCard: React.FC<{ post: Post }> = ({ post }) => (
    <Card sx={{ mb: 2, maxWidth: 600, mx: 'auto' }}>
      {/* Header del post */}
      <CardContent sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <Avatar 
              src={post.user.profilePicture} 
              alt={post.user.username}
              sx={{ mr: 2 }}
            />
            <Box>
              <Typography variant="subtitle2" fontWeight="bold">
                {post.user.username}
                {post.user.isVerified && (
                  <Chip label="✓" size="small" color="primary" sx={{ ml: 1, height: 16 }} />
                )}
              </Typography>
              {post.location && (
                <Typography variant="caption" color="textSecondary" display="flex" alignItems="center">
                  <LocationOn sx={{ fontSize: 12, mr: 0.5 }} />
                  {post.location}
                </Typography>
              )}
            </Box>
          </Box>
          <IconButton 
            onClick={(e) => {
              setAnchorEl(e.currentTarget);
              setSelectedPost(post);
            }}
          >
            <MoreVert />
          </IconButton>
        </Box>
      </CardContent>

      {/* Media del post */}
      {post.media.length > 0 && (
        <Box sx={{ position: 'relative' }}>
          {post.media[0].type === 'image' ? (
            <img 
              src={post.media[0].url} 
              alt="Post content"
              style={{ width: '100%', maxHeight: 600, objectFit: 'cover' }}
            />
          ) : (
            <video 
              src={post.media[0].url}
              poster={post.media[0].thumbnailUrl}
              controls
              style={{ width: '100%', maxHeight: 600 }}
            />
          )}
          
          {post.media.length > 1 && (
            <Chip 
              label={`1/${post.media.length}`}
              size="small"
              sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.6)', color: 'white' }}
            />
          )}
        </Box>
      )}

      {/* Acciones del post */}
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <IconButton onClick={() => handleLikePost(post.id)} color={post.isLiked ? 'error' : 'default'}>
              {post.isLiked ? <Favorite /> : <FavoriteBorder />}
            </IconButton>
            <IconButton>
              <Comment />
            </IconButton>
            <IconButton>
              <Share />
            </IconButton>
          </Box>
        </Box>

        {/* Contador de likes */}
        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
          {post.likesCount} me gusta
        </Typography>

        {/* Caption */}
        {post.caption && (
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>{post.user.username}</strong> {post.caption}
          </Typography>
        )}

        {/* Ver comentarios */}
        {post.commentsCount > 0 && (
          <Typography variant="body2" color="textSecondary" sx={{ mb: 1, cursor: 'pointer' }}>
            Ver los {post.commentsCount} comentarios
          </Typography>
        )}

        {/* Tiempo */}
        <Typography variant="caption" color="textSecondary">
          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: es })}
        </Typography>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 2 }}>
      {/* Stories placeholder */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Historias
        </Typography>
        <Box display="flex" gap={2} sx={{ overflowX: 'auto' }}>
          {/* Tu historia */}
          <Box textAlign="center" minWidth={70}>
            <Avatar sx={{ width: 56, height: 56, mb: 1, border: '2px solid #ddd' }}>
              <Add />
            </Avatar>
            <Typography variant="caption">Tu historia</Typography>
          </Box>
          
          {/* Historias de seguidos - placeholder */}
          {[1, 2, 3, 4, 5].map(i => (
            <Box key={i} textAlign="center" minWidth={70}>
              <Avatar 
                sx={{ 
                  width: 56, 
                  height: 56, 
                  mb: 1, 
                  border: '2px solid #e91e63' 
                }}
              />
              <Typography variant="caption">Usuario {i}</Typography>
            </Box>
          ))}
        </Box>
      </Card>

      {/* Posts */}
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}

      {/* Cargar más */}
      {hasMore && (
        <Box textAlign="center" sx={{ mt: 2 }}>
          <Button 
            onClick={loadMorePosts} 
            disabled={loadingMore}
            variant="outlined"
          >
            {loadingMore ? <CircularProgress size={24} /> : 'Cargar más'}
          </Button>
        </Box>
      )}

      {/* FAB para crear post */}
      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 80, right: 16 }}
        onClick={() => setOpenCreatePost(true)}
      >
        <Add />
      </Fab>

      {/* Dialog para crear post */}
      <Dialog open={openCreatePost} onClose={() => setOpenCreatePost(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Crear nueva publicación</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="¿Qué estás pensando?"
            value={newPost.caption}
            onChange={(e) => setNewPost(prev => ({ ...prev, caption: e.target.value }))}
            sx={{ mb: 2, mt: 1 }}
          />
          
          <TextField
            fullWidth
            placeholder="Agregar ubicación"
            value={newPost.location}
            onChange={(e) => setNewPost(prev => ({ ...prev, location: e.target.value }))}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />

          <Box display="flex" gap={2} sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<PhotoCamera />}
            >
              Foto
              <input
                type="file"
                hidden
                accept="image/*"
                multiple
                onChange={handleFileSelect}
              />
            </Button>
            
            <Button
              variant="outlined"
              component="label"
              startIcon={<Videocam />}
            >
              Video
              <input
                type="file"
                hidden
                accept="video/*"
                onChange={handleFileSelect}
              />
            </Button>
          </Box>

          {newPost.media.length > 0 && (
            <Typography variant="body2" color="textSecondary">
              {newPost.media.length} archivo(s) seleccionado(s)
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreatePost(false)}>Cancelar</Button>
          <Button onClick={handleCreatePost} variant="contained">
            Publicar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Menu de opciones del post */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => setAnchorEl(null)}>Compartir</MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>Copiar enlace</MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>Reportar</MenuItem>
      </Menu>
    </Container>
  );
};

export default FeedPage;
