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
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Badge,
  Paper,
  InputAdornment,
  Menu,
  MenuItem,
  Chip,
  Card,
  CardContent,
  Grid,
  Fab
} from '@mui/material';
import {
  Send,
  AttachFile,
  EmojiEmotions,
  Call,
  Videocam,
  Search,
  Add,
  MoreVert,
  PhotoCamera,
  Mic,
  Stop,
  PlayArrow,
  Pause,
  Close,
  Reply,
  Forward,
  Delete,
  Info,
  VolumeUp,
  VolumeOff,
  CallEnd,
  MicOff
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface Conversation {
  id: string;
  name: string;
  type: 'direct' | 'group';
  imageUrl?: string;
  participants: Array<{
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    role: string;
    isOnline: boolean;
  }>;
  lastMessage?: {
    id: string;
    content: string;
    type: string;
    senderId: string;
    createdAt: string;
  };
  unreadCount: number;
  lastActivityAt: string;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    role: string;
  };
  content?: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'sticker';
  mediaUrl?: string;
  thumbnailUrl?: string;
  fileName?: string;
  replyToMessage?: {
    id: string;
    content: string;
    sender: { username: string };
  };
  reactions: Array<{
    emoji: string;
    count: number;
    users: string[];
  }>;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  createdAt: string;
}

interface Call {
  id: string;
  conversationId: string;
  type: 'voice' | 'video';
  status: 'initiated' | 'ringing' | 'active' | 'ended';
  participants: Array<{
    id: string;
    username: string;
    profilePicture?: string;
    status: 'invited' | 'joined' | 'left';
  }>;
  startedAt: string;
  duration?: number;
}

const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [openNewChat, setOpenNewChat] = useState(false);
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Popular emojis for reactions
  const reactionEmojis = ['❤️', '😂', '😮', '😢', '😡', '👍', '👎', '🔥'];

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/conversations', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const tempMessage: Message = {
      id: Date.now().toString(),
      conversationId: selectedConversation.id,
      senderId: user?.id || '',
      sender: {
        id: user?.id || '',
        username: user?.username || '',
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        profilePicture: user?.profilePicture,
        role: user?.roles?.[0] || 'User'
      },
      content: newMessage,
      type: 'text',
      reactions: [],
      status: 'sending',
      createdAt: new Date().toISOString(),
      replyToMessage: replyToMessage ? {
        id: replyToMessage.id,
        content: replyToMessage.content || '',
        sender: { username: replyToMessage.sender.username }
      } : undefined
    };

    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');
    setReplyToMessage(null);

    try {
      const response = await fetch(`/api/conversations/${selectedConversation.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          content: newMessage,
          type: 'text',
          replyToMessageId: replyToMessage?.id
        })
      });

      if (response.ok) {
        const message = await response.json();
        setMessages(prev => prev.map(msg => 
          msg.id === tempMessage.id ? { ...message, status: 'sent' } : msg
        ));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.map(msg => 
        msg.id === tempMessage.id ? { ...msg, status: 'failed' } : msg
      ));
    }
  };

  const sendMediaMessage = async (file: File, type: 'image' | 'video' | 'audio' | 'document') => {
    if (!selectedConversation) return;

    const formData = new FormData();
    formData.append('media', file);
    formData.append('type', type);

    try {
      const response = await fetch(`/api/conversations/${selectedConversation.id}/messages`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });

      if (response.ok) {
        const message = await response.json();
        setMessages(prev => [...prev, message]);
      }
    } catch (error) {
      console.error('Error sending media message:', error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    let type: 'image' | 'video' | 'audio' | 'document' = 'document';
    if (file.type.startsWith('image/')) type = 'image';
    else if (file.type.startsWith('video/')) type = 'video';
    else if (file.type.startsWith('audio/')) type = 'audio';

    sendMediaMessage(file, type);
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const file = new File([blob], 'voice-message.wav', { type: 'audio/wav' });
        sendMediaMessage(file, 'audio');
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting voice recording:', error);
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const initiateCall = async (type: 'voice' | 'video') => {
    if (!selectedConversation) return;

    try {
      const response = await fetch(`/api/conversations/${selectedConversation.id}/calls`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ type })
      });

      if (response.ok) {
        const call = await response.json();
        setActiveCall(call);
      }
    } catch (error) {
      console.error('Error initiating call:', error);
    }
  };

  const endCall = async () => {
    if (!activeCall) return;

    try {
      await fetch(`/api/calls/${activeCall.id}/end`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setActiveCall(null);
    } catch (error) {
      console.error('Error ending call:', error);
    }
  };

  const addReaction = async (messageId: string, emoji: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}/reactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ emoji })
      });

      if (response.ok) {
        // Update local state
        setMessages(prev => prev.map(msg => {
          if (msg.id === messageId) {
            const existingReaction = msg.reactions.find(r => r.emoji === emoji);
            if (existingReaction) {
              return {
                ...msg,
                reactions: msg.reactions.map(r => 
                  r.emoji === emoji 
                    ? { ...r, count: r.count + 1, users: [...r.users, user?.id || ''] }
                    : r
                )
              };
            } else {
              return {
                ...msg,
                reactions: [...msg.reactions, { emoji, count: 1, users: [user?.id || ''] }]
              };
            }
          }
          return msg;
        }));
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.participants.some(p => 
      p.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <Box sx={{ height: '100vh', display: 'flex' }}>
      {/* Conversations sidebar */}
      <Paper sx={{ width: 350, display: 'flex', flexDirection: 'column', borderRadius: 0 }}>
        {/* Header */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Typography variant="h6" fontWeight="bold">
              Mensajes
            </Typography>
            <IconButton onClick={() => setOpenNewChat(true)}>
              <Add />
            </IconButton>
          </Box>
          
          <TextField
            fullWidth
            size="small"
            placeholder="Buscar conversaciones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              )
            }}
          />
        </Box>

        {/* Conversations list */}
        <List sx={{ flex: 1, overflow: 'auto', p: 0 }}>
          {filteredConversations.map(conversation => (
            <ListItem
              key={conversation.id}
              button
              selected={selectedConversation?.id === conversation.id}
              onClick={() => setSelectedConversation(conversation)}
              sx={{ py: 2 }}
            >
              <ListItemAvatar>
                <Badge
                  badgeContent={conversation.unreadCount}
                  color="error"
                  invisible={conversation.unreadCount === 0}
                >
                  <Avatar src={conversation.imageUrl}>
                    {conversation.type === 'group' ? '👥' : conversation.participants[0]?.username?.[0]}
                  </Avatar>
                </Badge>
              </ListItemAvatar>
              
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {conversation.name}
                    </Typography>
                    {conversation.participants.some(p => p.isOnline) && (
                      <Box sx={{ width: 8, height: 8, bgcolor: 'success.main', borderRadius: '50%' }} />
                    )}
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {conversation.lastMessage?.content || 'Sin mensajes'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDistanceToNow(new Date(conversation.lastActivityAt), { addSuffix: true, locale: es })}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Chat area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {selectedConversation ? (
          <>
            {/* Chat header */}
            <Paper sx={{ p: 2, borderRadius: 0, borderBottom: 1, borderColor: 'divider' }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar src={selectedConversation.imageUrl}>
                    {selectedConversation.type === 'group' ? '👥' : selectedConversation.participants[0]?.username?.[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      {selectedConversation.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {selectedConversation.type === 'group' 
                        ? `${selectedConversation.participants.length} participantes`
                        : selectedConversation.participants[0]?.isOnline ? 'En línea' : 'Desconectado'
                      }
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" gap={1}>
                  <IconButton onClick={() => initiateCall('voice')}>
                    <Call />
                  </IconButton>
                  <IconButton onClick={() => initiateCall('video')}>
                    <Videocam />
                  </IconButton>
                  <IconButton>
                    <Info />
                  </IconButton>
                </Box>
              </Box>
            </Paper>

            {/* Messages area */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
              {messages.map(message => (
                <Box
                  key={message.id}
                  sx={{
                    display: 'flex',
                    justifyContent: message.senderId === user?.id ? 'flex-end' : 'flex-start',
                    mb: 1
                  }}
                >
                  <Box sx={{ maxWidth: '70%' }}>
                    {message.senderId !== user?.id && (
                      <Box display="flex" alignItems="center" gap={1} sx={{ mb: 0.5 }}>
                        <Avatar src={message.sender.profilePicture} sx={{ width: 24, height: 24 }} />
                        <Typography variant="caption" color="text.secondary">
                          {message.sender.username}
                        </Typography>
                        <Chip 
                          label={message.sender.role} 
                          size="small" 
                          sx={{ height: 16, fontSize: '0.6rem' }}
                          color={
                            message.sender.role === 'SuperAdmin' ? 'secondary' :
                            message.sender.role === 'Admin' ? 'primary' :
                            message.sender.role === 'Model' ? 'error' :
                            message.sender.role === 'Study' ? 'success' : 'default'
                          }
                        />
                      </Box>
                    )}

                    {/* Reply preview */}
                    {message.replyToMessage && (
                      <Paper sx={{ p: 1, mb: 0.5, bgcolor: 'grey.100', borderLeft: 3, borderColor: 'primary.main' }}>
                        <Typography variant="caption" color="primary.main" fontWeight="bold">
                          {message.replyToMessage.sender.username}
                        </Typography>
                        <Typography variant="caption" display="block" noWrap>
                          {message.replyToMessage.content}
                        </Typography>
                      </Paper>
                    )}

                    <Paper
                      sx={{
                        p: 1.5,
                        bgcolor: message.senderId === user?.id ? 'primary.main' : 'grey.100',
                        color: message.senderId === user?.id ? 'white' : 'text.primary',
                        borderRadius: 2,
                        position: 'relative'
                      }}
                    >
                      {/* Message content */}
                      {message.type === 'text' && (
                        <Typography variant="body2">
                          {message.content}
                        </Typography>
                      )}

                      {message.type === 'image' && (
                        <Box>
                          <img
                            src={message.mediaUrl}
                            alt="Imagen"
                            style={{ maxWidth: '100%', borderRadius: 8 }}
                          />
                          {message.content && (
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              {message.content}
                            </Typography>
                          )}
                        </Box>
                      )}

                      {message.type === 'video' && (
                        <Box>
                          <video
                            src={message.mediaUrl}
                            controls
                            style={{ maxWidth: '100%', borderRadius: 8 }}
                          />
                          {message.content && (
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              {message.content}
                            </Typography>
                          )}
                        </Box>
                      )}

                      {message.type === 'audio' && (
                        <Box display="flex" alignItems="center" gap={1}>
                          <IconButton size="small">
                            <PlayArrow />
                          </IconButton>
                          <Typography variant="body2">
                            Mensaje de voz
                          </Typography>
                        </Box>
                      )}

                      {/* Message timestamp and status */}
                      <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mt: 0.5 }}>
                        <Typography variant="caption" sx={{ opacity: 0.7 }}>
                          {formatTime(message.createdAt)}
                        </Typography>
                        {message.senderId === user?.id && (
                          <Typography variant="caption" sx={{ opacity: 0.7 }}>
                            {message.status === 'sent' && '✓'}
                            {message.status === 'delivered' && '✓✓'}
                            {message.status === 'read' && '✓✓'}
                          </Typography>
                        )}
                      </Box>

                      {/* Message reactions */}
                      {message.reactions.length > 0 && (
                        <Box display="flex" gap={0.5} sx={{ mt: 1 }}>
                          {message.reactions.map(reaction => (
                            <Chip
                              key={reaction.emoji}
                              label={`${reaction.emoji} ${reaction.count}`}
                              size="small"
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                          ))}
                        </Box>
                      )}

                      {/* Message actions menu */}
                      <IconButton
                        size="small"
                        sx={{ position: 'absolute', top: -10, right: -10, bgcolor: 'background.paper' }}
                      >
                        <MoreVert fontSize="small" />
                      </IconButton>
                    </Paper>

                    {/* Quick reactions */}
                    <Box display="flex" gap={0.5} sx={{ mt: 0.5, opacity: 0.7 }}>
                      {reactionEmojis.slice(0, 3).map(emoji => (
                        <IconButton
                          key={emoji}
                          size="small"
                          onClick={() => addReaction(message.id, emoji)}
                          sx={{ fontSize: '0.8rem', p: 0.5 }}
                        >
                          {emoji}
                        </IconButton>
                      ))}
                      <IconButton
                        size="small"
                        onClick={() => setReplyToMessage(message)}
                        sx={{ p: 0.5 }}
                      >
                        <Reply fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </Box>
              ))}
              <div ref={messagesEndRef} />
            </Box>

            {/* Reply preview */}
            {replyToMessage && (
              <Paper sx={{ p: 1, m: 1, bgcolor: 'grey.50', borderLeft: 3, borderColor: 'primary.main' }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="caption" color="primary.main" fontWeight="bold">
                      Respondiendo a {replyToMessage.sender.username}
                    </Typography>
                    <Typography variant="caption" display="block" noWrap>
                      {replyToMessage.content}
                    </Typography>
                  </Box>
                  <IconButton size="small" onClick={() => setReplyToMessage(null)}>
                    <Close />
                  </IconButton>
                </Box>
              </Paper>
            )}

            {/* Message input */}
            <Paper sx={{ p: 2, borderRadius: 0 }}>
              <Box display="flex" alignItems="center" gap={1}>
                <IconButton onClick={() => fileInputRef.current?.click()}>
                  <AttachFile />
                </IconButton>
                
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Escribe un mensaje..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  multiline
                  maxRows={4}
                />

                {isRecording ? (
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="caption" color="error">
                      {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                    </Typography>
                    <IconButton color="error" onClick={stopVoiceRecording}>
                      <Stop />
                    </IconButton>
                  </Box>
                ) : (
                  <IconButton onClick={startVoiceRecording}>
                    <Mic />
                  </IconButton>
                )}

                <IconButton color="primary" onClick={sendMessage} disabled={!newMessage.trim()}>
                  <Send />
                </IconButton>
              </Box>
            </Paper>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              hidden
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
              onChange={handleFileSelect}
            />
          </>
        ) : (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            sx={{ flex: 1, bgcolor: 'grey.50' }}
          >
            <Typography variant="h6" color="text.secondary">
              Selecciona una conversación para comenzar
            </Typography>
          </Box>
        )}
      </Box>

      {/* Active call overlay */}
      {activeCall && (
        <Dialog open={true} maxWidth="md" fullWidth>
          <DialogContent>
            <Box textAlign="center" sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                {activeCall.type === 'video' ? 'Videollamada' : 'Llamada de voz'}
              </Typography>
              
              <Grid container spacing={2} justifyContent="center" sx={{ mb: 3 }}>
                {activeCall.participants.map(participant => (
                  <Grid item key={participant.id}>
                    <Box textAlign="center">
                      <Avatar
                        src={participant.profilePicture}
                        sx={{ width: 80, height: 80, mx: 'auto', mb: 1 }}
                      />
                      <Typography variant="subtitle2">
                        {participant.username}
                      </Typography>
                      <Chip
                        label={participant.status}
                        size="small"
                        color={participant.status === 'joined' ? 'success' : 'default'}
                      />
                    </Box>
                  </Grid>
                ))}
              </Grid>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {activeCall.status === 'ringing' && 'Llamando...'}
                {activeCall.status === 'active' && `Duración: ${Math.floor((activeCall.duration || 0) / 60)}:${((activeCall.duration || 0) % 60).toString().padStart(2, '0')}`}
              </Typography>

              <Box display="flex" justifyContent="center" gap={2}>
                <IconButton color="error" onClick={endCall} sx={{ bgcolor: 'error.main', color: 'white' }}>
                  <CallEnd />
                </IconButton>
                <IconButton sx={{ bgcolor: 'grey.300' }}>
                  <MicOff />
                </IconButton>
                {activeCall.type === 'video' && (
                  <IconButton sx={{ bgcolor: 'grey.300' }}>
                    <Videocam />
                  </IconButton>
                )}
              </Box>
            </Box>
          </DialogContent>
        </Dialog>
      )}

      {/* New chat dialog */}
      <Dialog open={openNewChat} onClose={() => setOpenNewChat(false)} maxWidth="sm" fullWidth>
        <DialogContent>
          <Typography variant="h6" gutterBottom>
            Nueva conversación
          </Typography>
          <TextField
            fullWidth
            placeholder="Buscar usuarios..."
            sx={{ mb: 2 }}
          />
          {/* User list would go here */}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default MessagesPage;
