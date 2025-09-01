import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Avatar,
  Typography,
  IconButton,
  Button,
  Dialog,
  DialogContent,
  TextField,
  Fab,
  LinearProgress,
  Chip,
  Menu,
  MenuItem,
  Slider,
  Card,
  CardContent,
  Popover,
  Grid,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  Add,
  Close,
  PhotoCamera,
  Videocam,
  TextFields,
  EmojiEmotions,
  Poll,
  QuestionAnswer,
  MusicNote,
  Palette,
  Send,
  MoreVert,
  Favorite,
  FavoriteBorder,
  Reply,
  LocationOn,
  AlternateEmail,
  Tag,
  DragIndicator
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface Story {
  id: string;
  userId: string;
  user: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    role: string;
  };
  type: 'photo' | 'video' | 'text';
  mediaUrl?: string;
  thumbnailUrl?: string;
  text?: string;
  backgroundColor?: string;
  textColor?: string;
  fontFamily?: string;
  duration?: number;
  musicTitle?: string;
  musicArtist?: string;
  viewsCount: number;
  repliesCount: number;
  createdAt: string;
  expiresAt: string;
  isHighlight: boolean;
  stickers: StorySticker[];
  polls: StoryPoll[];
  questions: StoryQuestion[];
  hasViewed: boolean;
}

interface StorySticker {
  id: string;
  type: 'emoji' | 'gif' | 'location' | 'mention' | 'hashtag';
  content: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
}

interface StoryPoll {
  id: string;
  question: string;
  options: string[];
  votes: { [key: string]: number };
  userVote?: string;
  x: number;
  y: number;
}

interface StoryQuestion {
  id: string;
  question: string;
  responses: Array<{
    id: string;
    userId: string;
    username: string;
    response: string;
    createdAt: string;
  }>;
  x: number;
  y: number;
}

interface CreateStoryData {
  type: 'photo' | 'video' | 'text';
  file?: File;
  text: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  stickers: StorySticker[];
  polls: StoryPoll[];
  questions: StoryQuestion[];
  musicTitle?: string;
  musicArtist?: string;
}

const StoriesPage: React.FC = () => {
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [currentStory, setCurrentStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [openCreateStory, setOpenCreateStory] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [emojiAnchor, setEmojiAnchor] = useState<HTMLElement | null>(null);
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  
  const progressRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const storyCanvasRef = useRef<HTMLDivElement>(null);

  const [newStory, setNewStory] = useState<CreateStoryData>({
    type: 'text',
    text: '',
    backgroundColor: '#667eea',
    textColor: '#ffffff',
    fontFamily: 'Arial',
    stickers: [],
    polls: [],
    questions: []
  });

  // Emojis populares para stickers
  const popularEmojis = [
    '😀', '😂', '🥰', '😍', '🤔', '😎', '🔥', '💯',
    '❤️', '💕', '👍', '👏', '🙌', '💪', '✨', '🌟',
    '🎉', '🎊', '🎈', '🎁', '🌈', '☀️', '🌙', '⭐'
  ];

  // Colores predefinidos para stories de texto
  const backgroundColors = [
    '#667eea', '#764ba2', '#f093fb', '#f5576c',
    '#4facfe', '#43e97b', '#fa709a', '#ffecd2',
    '#ff9a9e', '#a8edea', '#d299c2', '#ffeaa7'
  ];

  const fontFamilies = [
    'Arial', 'Helvetica', 'Georgia', 'Times New Roman',
    'Courier New', 'Verdana', 'Impact', 'Comic Sans MS',
    'Roboto', 'Open Sans', 'Montserrat', 'Poppins'
  ];

  useEffect(() => {
    fetchStories();
  }, []);

  useEffect(() => {
    if (stories.length > 0 && currentStoryIndex < stories.length) {
      setCurrentStory(stories[currentStoryIndex]);
      setProgress(0);
      startProgress();
    }
  }, [currentStoryIndex, stories]);

  const fetchStories = async () => {
    try {
      const response = await fetch('/api/stories/feed', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setStories(data.stories || []);
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const startProgress = () => {
    if (progressRef.current) clearInterval(progressRef.current);
    
    const duration = currentStory?.type === 'video' ? 
      (currentStory.duration || 15) * 1000 : 5000;
    
    const increment = 100 / (duration / 100);
    
    progressRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          nextStory();
          return 0;
        }
        return prev + increment;
      });
    }, 100);
  };

  const pauseProgress = () => {
    if (progressRef.current) {
      clearInterval(progressRef.current);
      setIsPaused(true);
    }
  };

  const resumeProgress = () => {
    if (isPaused) {
      startProgress();
      setIsPaused(false);
    }
  };

  const nextStory = () => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
    } else {
      // Volver al inicio o cerrar
      setCurrentStoryIndex(0);
    }
  };

  const previousStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
    }
  };

  const handleCreateStory = async () => {
    try {
      const formData = new FormData();
      formData.append('type', newStory.type);
      formData.append('text', newStory.text);
      formData.append('backgroundColor', newStory.backgroundColor);
      formData.append('textColor', newStory.textColor);
      formData.append('fontFamily', newStory.fontFamily);
      formData.append('stickers', JSON.stringify(newStory.stickers));
      formData.append('polls', JSON.stringify(newStory.polls));
      formData.append('questions', JSON.stringify(newStory.questions));
      
      if (newStory.file) {
        formData.append('media', newStory.file);
      }

      const response = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });

      if (response.ok) {
        await fetchStories();
        setOpenCreateStory(false);
        resetNewStory();
      }
    } catch (error) {
      console.error('Error creating story:', error);
    }
  };

  const resetNewStory = () => {
    setNewStory({
      type: 'text',
      text: '',
      backgroundColor: '#667eea',
      textColor: '#ffffff',
      fontFamily: 'Arial',
      stickers: [],
      polls: [],
      questions: []
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const type = file.type.startsWith('video/') ? 'video' : 'photo';
      setNewStory(prev => ({ ...prev, file, type }));
    }
  };

  const addPoll = () => {
    const newPoll: StoryPoll = {
      id: Date.now().toString(),
      question: '¿Qué prefieres?',
      options: ['Opción A', 'Opción B'],
      votes: {},
      x: 50,
      y: 50
    };
    setNewStory(prev => ({ ...prev, polls: [...prev.polls, newPoll] }));
  };

  const updatePoll = (pollId: string, field: string, value: any) => {
    setNewStory(prev => ({
      ...prev,
      polls: prev.polls.map(poll =>
        poll.id === pollId ? { ...poll, [field]: value } : poll
      )
    }));
  };

  const addQuestion = () => {
    const newQuestion: StoryQuestion = {
      id: Date.now().toString(),
      question: '¿Tienes alguna pregunta?',
      responses: [],
      x: 50,
      y: 70
    };
    setNewStory(prev => ({ ...prev, questions: [...prev.questions, newQuestion] }));
  };

  const updateQuestion = (questionId: string, question: string) => {
    setNewStory(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
        q.id === questionId ? { ...q, question } : q
      )
    }));
  };

  const removePoll = (pollId: string) => {
    setNewStory(prev => ({
      ...prev,
      polls: prev.polls.filter(poll => poll.id !== pollId)
    }));
  };

  const removeQuestion = (questionId: string) => {
    setNewStory(prev => ({
      ...prev,
      questions: prev.questions.filter(question => question.id !== questionId)
    }));
  };

  const removeSticker = (stickerId: string) => {
    setNewStory(prev => ({
      ...prev,
      stickers: prev.stickers.filter(sticker => sticker.id !== stickerId)
    }));
  };

  const addSticker = (emoji: string) => {
    const newSticker: StorySticker = {
      id: Date.now().toString(),
      type: 'emoji',
      content: emoji,
      x: 50,
      y: 50,
      rotation: 0,
      scale: 1
    };
    setNewStory(prev => ({ ...prev, stickers: [...prev.stickers, newSticker] }));
    setEmojiAnchor(null);
  };

  const updateStickerPosition = (stickerId: string, x: number, y: number) => {
    setNewStory(prev => ({
      ...prev,
      stickers: prev.stickers.map(sticker =>
        sticker.id === stickerId ? { ...sticker, x, y } : sticker
      )
    }));
  };

  const updatePollPosition = (pollId: string, x: number, y: number) => {
    setNewStory(prev => ({
      ...prev,
      polls: prev.polls.map(poll =>
        poll.id === pollId ? { ...poll, x, y } : poll
      )
    }));
  };

  const updateQuestionPosition = (questionId: string, x: number, y: number) => {
    setNewStory(prev => ({
      ...prev,
      questions: prev.questions.map(question =>
        question.id === questionId ? { ...question, x, y } : question
      )
    }));
  };

  const handlePollVote = async (pollId: string, option: string) => {
    if (!currentStory) return;

    try {
      const response = await fetch(`/api/stories/${currentStory.id}/polls/${pollId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ option })
      });

      if (response.ok) {
        // Actualizar el estado local
        setStories(prev => prev.map(story => {
          if (story.id === currentStory.id) {
            return {
              ...story,
              polls: story.polls.map(poll => {
                if (poll.id === pollId) {
                  const newVotes = { ...poll.votes };
                  newVotes[option] = (newVotes[option] || 0) + 1;
                  return { ...poll, votes: newVotes, userVote: option };
                }
                return poll;
              })
            };
          }
          return story;
        }));
      }
    } catch (error) {
      console.error('Error voting on poll:', error);
    }
  };

  const handleQuestionResponse = async (questionId: string, response: string) => {
    if (!currentStory || !response.trim()) return;

    try {
      const apiResponse = await fetch(`/api/stories/${currentStory.id}/questions/${questionId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ response: response.trim() })
      });

      if (apiResponse.ok) {
        // Limpiar el campo de respuesta
        const questionInput = document.querySelector(`#question-${questionId}`) as HTMLInputElement;
        if (questionInput) questionInput.value = '';
      }
    } catch (error) {
      console.error('Error responding to question:', error);
    }
  };

  const handleReplyToStory = async () => {
    if (!currentStory || !replyText.trim()) return;

    try {
      const response = await fetch(`/api/stories/${currentStory.id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ message: replyText })
      });

      if (response.ok) {
        setReplyText('');
        setShowReplies(false);
      }
    } catch (error) {
      console.error('Error replying to story:', error);
    }
  };

  const StoryViewer: React.FC = () => {
    if (!currentStory) return null;

    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: 'black',
          zIndex: 1300,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Progress bars */}
        <Box sx={{ display: 'flex', p: 1, gap: 0.5 }}>
          {stories.map((_, index) => (
            <LinearProgress
              key={index}
              variant="determinate"
              value={index === currentStoryIndex ? progress : index < currentStoryIndex ? 100 : 0}
              sx={{ flex: 1, height: 2, borderRadius: 1 }}
            />
          ))}
        </Box>

        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', p: 2, color: 'white' }}>
          <Avatar src={currentStory.user.profilePicture} sx={{ mr: 2 }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" fontWeight="bold">
              {currentStory.user.username}
              <Chip 
                label={currentStory.user.role} 
                size="small" 
                sx={{ ml: 1, height: 20 }}
                color={
                  currentStory.user.role === 'SuperAdmin' ? 'secondary' :
                  currentStory.user.role === 'Admin' ? 'primary' :
                  currentStory.user.role === 'Model' ? 'error' :
                  currentStory.user.role === 'Study' ? 'success' : 'default'
                }
              />
            </Typography>
            <Typography variant="caption" color="grey.300">
              {formatDistanceToNow(new Date(currentStory.createdAt), { addSuffix: true, locale: es })}
            </Typography>
          </Box>
          <IconButton sx={{ color: 'white' }} onClick={() => setCurrentStoryIndex(0)}>
            <Close />
          </IconButton>
        </Box>

        {/* Story content */}
        <Box
          sx={{ 
            flex: 1, 
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseDown={pauseProgress}
          onMouseUp={resumeProgress}
          onTouchStart={pauseProgress}
          onTouchEnd={resumeProgress}
        >
          {/* Navigation areas */}
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: '30%',
              zIndex: 10,
              cursor: 'pointer'
            }}
            onClick={previousStory}
          />
          <Box
            sx={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: '30%',
              zIndex: 10,
              cursor: 'pointer'
            }}
            onClick={nextStory}
          />

          {/* Media content */}
          {currentStory.type === 'photo' && currentStory.mediaUrl && (
            <img
              src={currentStory.mediaUrl}
              alt="Story"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain'
              }}
            />
          )}

          {currentStory.type === 'video' && currentStory.mediaUrl && (
            <video
              ref={videoRef}
              src={currentStory.mediaUrl}
              autoPlay
              muted
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain'
              }}
            />
          )}

          {currentStory.type === 'text' && (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: currentStory.backgroundColor || '#667eea',
                p: 4
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  color: currentStory.textColor || 'white',
                  fontFamily: currentStory.fontFamily || 'Arial',
                  textAlign: 'center',
                  wordBreak: 'break-word'
                }}
              >
                {currentStory.text}
              </Typography>
            </Box>
          )}

          {/* Stickers overlay */}
          {currentStory.stickers.map(sticker => (
            <Box
              key={sticker.id}
              sx={{
                position: 'absolute',
                left: `${sticker.x}%`,
                top: `${sticker.y}%`,
                transform: `translate(-50%, -50%) rotate(${sticker.rotation}deg) scale(${sticker.scale})`,
                fontSize: '2rem',
                zIndex: 5
              }}
            >
              {sticker.content}
            </Box>
          ))}

          {/* Polls */}
          {currentStory.polls.map(poll => (
            <Card
              key={poll.id}
              sx={{
                position: 'absolute',
                left: `${poll.x}%`,
                top: `${poll.y}%`,
                transform: 'translate(-50%, -50%)',
                minWidth: 200,
                maxWidth: 280,
                bgcolor: 'rgba(0,0,0,0.8)',
                color: 'white',
                backdropFilter: 'blur(10px)'
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                  {poll.question}
                </Typography>
                {poll.options.map((option, index) => {
                  const totalVotes = Object.values(poll.votes).reduce((a, b) => a + b, 0);
                  const optionVotes = poll.votes[option] || 0;
                  const percentage = totalVotes > 0 ? (optionVotes / totalVotes) * 100 : 0;
                  
                  return (
                    <Button
                      key={index}
                      fullWidth
                      variant={poll.userVote === option ? 'contained' : 'outlined'}
                      sx={{ 
                        mb: 1, 
                        color: 'white', 
                        borderColor: 'white',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                      onClick={() => handlePollVote(poll.id, option)}
                      disabled={!!poll.userVote}
                    >
                      {poll.userVote && (
                        <Box
                          sx={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: `${percentage}%`,
                            bgcolor: 'rgba(255,255,255,0.2)',
                            transition: 'width 0.3s ease'
                          }}
                        />
                      )}
                      <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <span>{option}</span>
                        {poll.userVote && <span>{Math.round(percentage)}%</span>}
                      </Box>
                    </Button>
                  );
                })}
                {Object.values(poll.votes).reduce((a, b) => a + b, 0) > 0 && (
                  <Typography variant="caption" sx={{ opacity: 0.7, mt: 1, display: 'block' }}>
                    {Object.values(poll.votes).reduce((a, b) => a + b, 0)} votos
                  </Typography>
                )}
              </CardContent>
            </Card>
          ))}

          {/* Questions */}
          {currentStory.questions.map(question => (
            <Card
              key={question.id}
              sx={{
                position: 'absolute',
                left: `${question.x}%`,
                top: `${question.y}%`,
                transform: 'translate(-50%, -50%)',
                minWidth: 250,
                maxWidth: 300,
                bgcolor: 'rgba(0,0,0,0.8)',
                color: 'white',
                backdropFilter: 'blur(10px)'
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                  {question.question}
                </Typography>
                <TextField
                  id={`question-${question.id}`}
                  fullWidth
                  placeholder="Escribe tu respuesta..."
                  size="small"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const target = e.target as HTMLInputElement;
                      handleQuestionResponse(question.id, target.value);
                    }
                  }}
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      color: 'white',
                      '& fieldset': { borderColor: 'white' },
                      '& input::placeholder': { color: 'rgba(255,255,255,0.7)' }
                    }
                  }}
                />
                {question.responses.length > 0 && (
                  <Typography variant="caption" sx={{ opacity: 0.7, mt: 1, display: 'block' }}>
                    {question.responses.length} respuestas
                  </Typography>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Bottom actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', p: 2, color: 'white' }}>
          <TextField
            fullWidth
            placeholder="Responder..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            size="small"
            sx={{
              mr: 2,
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': { borderColor: 'rgba(255,255,255,0.5)' }
              }
            }}
          />
          <IconButton sx={{ color: 'white' }} onClick={handleReplyToStory}>
            <Send />
          </IconButton>
          <IconButton sx={{ color: 'white' }}>
            <Favorite />
          </IconButton>
        </Box>
      </Box>
    );
  };

  return (
    <Container maxWidth="sm" sx={{ py: 2 }}>
      {/* Stories grid */}
      <Box display="flex" gap={2} sx={{ overflowX: 'auto', mb: 3 }}>
        {/* Create story */}
        <Box textAlign="center" minWidth={70}>
          <Avatar 
            sx={{ 
              width: 70, 
              height: 70, 
              mb: 1, 
              border: '2px dashed #ddd',
              cursor: 'pointer'
            }}
            onClick={() => setOpenCreateStory(true)}
          >
            <Add />
          </Avatar>
          <Typography variant="caption">Tu historia</Typography>
        </Box>

        {/* User stories */}
        {stories.map((story, index) => (
          <Box key={story.id} textAlign="center" minWidth={70}>
            <Avatar
              src={story.user.profilePicture}
              sx={{
                width: 70,
                height: 70,
                mb: 1,
                border: story.hasViewed ? '2px solid #ddd' : '2px solid #e91e63',
                cursor: 'pointer'
              }}
              onClick={() => setCurrentStoryIndex(index)}
            />
            <Typography variant="caption">
              {story.user.username}
            </Typography>
            <Chip 
              label={story.user.role} 
              size="small" 
              sx={{ display: 'block', mt: 0.5 }}
              color={
                story.user.role === 'SuperAdmin' ? 'secondary' :
                story.user.role === 'Admin' ? 'primary' :
                story.user.role === 'Model' ? 'error' :
                story.user.role === 'Study' ? 'success' : 'default'
              }
            />
          </Box>
        ))}
      </Box>

      {/* Story viewer */}
      {currentStory && <StoryViewer />}

      {/* Create story dialog */}
      <Dialog open={openCreateStory} onClose={() => setOpenCreateStory(false)} maxWidth="md" fullWidth>
        <DialogContent>
          <Typography variant="h6" gutterBottom>
            Crear Historia
          </Typography>

          {/* Story type selection */}
          <Box display="flex" gap={2} sx={{ mb: 3 }}>
            <Button
              variant={newStory.type === 'text' ? 'contained' : 'outlined'}
              startIcon={<TextFields />}
              onClick={() => setNewStory(prev => ({ ...prev, type: 'text' }))}
            >
              Texto
            </Button>
            <Button
              variant="outlined"
              component="label"
              startIcon={<PhotoCamera />}
            >
              Foto
              <input type="file" hidden accept="image/*" onChange={handleFileSelect} />
            </Button>
            <Button
              variant="outlined"
              component="label"
              startIcon={<Videocam />}
            >
              Video
              <input type="file" hidden accept="video/*" onChange={handleFileSelect} />
            </Button>
          </Box>

          <Grid container spacing={3}>
            {/* Story preview */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Vista previa:
              </Typography>
              <Box
                ref={storyCanvasRef}
                sx={{
                  width: '100%',
                  height: 400,
                  border: '2px dashed #ddd',
                  borderRadius: 2,
                  position: 'relative',
                  overflow: 'hidden',
                  background: newStory.type === 'text' ? newStory.backgroundColor : '#f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {newStory.type === 'text' && newStory.text && (
                  <Typography
                    variant="h5"
                    sx={{
                      color: newStory.textColor,
                      fontFamily: newStory.fontFamily,
                      textAlign: 'center',
                      p: 2,
                      wordBreak: 'break-word'
                    }}
                  >
                    {newStory.text}
                  </Typography>
                )}

                {newStory.file && newStory.type === 'photo' && (
                  <img
                    src={URL.createObjectURL(newStory.file)}
                    alt="Preview"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain'
                    }}
                  />
                )}

                {/* Stickers overlay */}
                {newStory.stickers.map(sticker => (
                  <Box
                    key={sticker.id}
                    sx={{
                      position: 'absolute',
                      left: `${sticker.x}%`,
                      top: `${sticker.y}%`,
                      transform: `translate(-50%, -50%) rotate(${sticker.rotation}deg) scale(${sticker.scale})`,
                      fontSize: '2rem',
                      cursor: 'move',
                      zIndex: 5,
                      '&:hover': {
                        transform: `translate(-50%, -50%) rotate(${sticker.rotation}deg) scale(${sticker.scale * 1.1})`
                      }
                    }}
                    onClick={() => removeSticker(sticker.id)}
                  >
                    {sticker.content}
                  </Box>
                ))}

                {/* Polls preview */}
                {newStory.polls.map(poll => (
                  <Card
                    key={poll.id}
                    sx={{
                      position: 'absolute',
                      left: `${poll.x}%`,
                      top: `${poll.y}%`,
                      transform: 'translate(-50%, -50%)',
                      minWidth: 150,
                      bgcolor: 'rgba(0,0,0,0.7)',
                      color: 'white',
                      cursor: 'move'
                    }}
                  >
                    <CardContent sx={{ p: 1 }}>
                      <Typography variant="caption" gutterBottom>
                        {poll.question}
                      </Typography>
                      {poll.options.map((option, index) => (
                        <Button
                          key={index}
                          fullWidth
                          size="small"
                          variant="outlined"
                          sx={{ mb: 0.5, color: 'white', borderColor: 'white', fontSize: '0.7rem' }}
                        >
                          {option}
                        </Button>
                      ))}
                      <IconButton
                        size="small"
                        sx={{ color: 'white', position: 'absolute', top: 0, right: 0 }}
                        onClick={() => removePoll(poll.id)}
                      >
                        <Close fontSize="small" />
                      </IconButton>
                    </CardContent>
                  </Card>
                ))}

                {/* Questions preview */}
                {newStory.questions.map(question => (
                  <Card
                    key={question.id}
                    sx={{
                      position: 'absolute',
                      left: `${question.x}%`,
                      top: `${question.y}%`,
                      transform: 'translate(-50%, -50%)',
                      minWidth: 180,
                      bgcolor: 'rgba(0,0,0,0.7)',
                      color: 'white',
                      cursor: 'move'
                    }}
                  >
                    <CardContent sx={{ p: 1 }}>
                      <Typography variant="caption" gutterBottom>
                        {question.question}
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Responder..."
                        disabled
                        sx={{ 
                          '& .MuiOutlinedInput-root': { 
                            color: 'white',
                            fontSize: '0.7rem'
                          }
                        }}
                      />
                      <IconButton
                        size="small"
                        sx={{ color: 'white', position: 'absolute', top: 0, right: 0 }}
                        onClick={() => removeQuestion(question.id)}
                      >
                        <Close fontSize="small" />
                      </IconButton>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Grid>

            {/* Story options */}
            <Grid item xs={12} md={6}>
              {/* Text story options */}
              {newStory.type === 'text' && (
                <>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="Escribe tu historia..."
                    value={newStory.text}
                    onChange={(e) => setNewStory(prev => ({ ...prev, text: e.target.value }))}
                    sx={{ mb: 2 }}
                  />

                  {/* Background colors */}
                  <Typography variant="subtitle2" gutterBottom>
                    Color de fondo:
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
                    {backgroundColors.map(color => (
                      <Box
                        key={color}
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: color,
                          borderRadius: 1,
                          cursor: 'pointer',
                          border: newStory.backgroundColor === color ? '3px solid #000' : '2px solid #ddd'
                        }}
                        onClick={() => setNewStory(prev => ({ ...prev, backgroundColor: color }))}
                      />
                    ))}
                  </Box>

                  {/* Font family */}
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Fuente</InputLabel>
                    <Select
                      value={newStory.fontFamily}
                      onChange={(e) => setNewStory(prev => ({ ...prev, fontFamily: e.target.value }))}
                    >
                      {fontFamilies.map(font => (
                        <MenuItem key={font} value={font}>
                          <span style={{ fontFamily: font }}>{font}</span>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </>
              )}

              {/* Interactive elements */}
              <Typography variant="subtitle2" gutterBottom>
                Elementos interactivos:
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
                <Button 
                  size="small" 
                  startIcon={<EmojiEmotions />} 
                  onClick={(e) => setEmojiAnchor(e.currentTarget)}
                >
                  Stickers
                </Button>
                <Button size="small" startIcon={<Poll />} onClick={addPoll}>
                  Encuesta
                </Button>
                <Button size="small" startIcon={<QuestionAnswer />} onClick={addQuestion}>
                  Pregunta
                </Button>
                <Button size="small" startIcon={<MusicNote />}>
                  Música
                </Button>
                <Button size="small" startIcon={<LocationOn />}>
                  Ubicación
                </Button>
              </Box>

              {/* Polls configuration */}
              {newStory.polls.length > 0 && (
                <>
                  <Typography variant="subtitle2" gutterBottom>
                    Encuestas:
                  </Typography>
                  {newStory.polls.map((poll, index) => (
                    <Card key={poll.id} sx={{ mb: 2 }}>
                      <CardContent>
                        <TextField
                          fullWidth
                          size="small"
                          label="Pregunta"
                          value={poll.question}
                          onChange={(e) => updatePoll(poll.id, 'question', e.target.value)}
                          sx={{ mb: 1 }}
                        />
                        {poll.options.map((option, optIndex) => (
                          <TextField
                            key={optIndex}
                            fullWidth
                            size="small"
                            label={`Opción ${optIndex + 1}`}
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...poll.options];
                              newOptions[optIndex] = e.target.value;
                              updatePoll(poll.id, 'options', newOptions);
                            }}
                            sx={{ mb: 1 }}
                          />
                        ))}
                      </CardContent>
                    </Card>
                  ))}
                </>
              )}

              {/* Questions configuration */}
              {newStory.questions.length > 0 && (
                <>
                  <Typography variant="subtitle2" gutterBottom>
                    Preguntas:
                  </Typography>
                  {newStory.questions.map(question => (
                    <Card key={question.id} sx={{ mb: 2 }}>
                      <CardContent>
                        <TextField
                          fullWidth
                          size="small"
                          label="Pregunta"
                          value={question.question}
                          onChange={(e) => updateQuestion(question.id, e.target.value)}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </>
              )}
            </Grid>
          </Grid>

          {/* Action buttons */}
          <Box display="flex" justifyContent="space-between" sx={{ mt: 3 }}>
            <Button onClick={() => setOpenCreateStory(false)}>
              Cancelar
            </Button>
            <Button variant="contained" onClick={handleCreateStory}>
              Publicar Historia
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Emoji picker popover */}
      <Popover
        open={Boolean(emojiAnchor)}
        anchorEl={emojiAnchor}
        onClose={() => setEmojiAnchor(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Box sx={{ p: 2, maxWidth: 300 }}>
          <Typography variant="subtitle2" gutterBottom>
            Selecciona un sticker:
          </Typography>
          <Grid container spacing={1}>
            {popularEmojis.map(emoji => (
              <Grid item key={emoji}>
                <Button
                  sx={{ minWidth: 40, fontSize: '1.5rem' }}
                  onClick={() => addSticker(emoji)}
                >
                  {emoji}
                </Button>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Popover>
    </Container>
  );
};

export default StoriesPage;
