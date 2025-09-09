import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  TextField,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Badge,
  InputAdornment,
  Slide
} from '@mui/material';
import {
  Close,
  Send,
  Search,
  MoreVert,
  Phone,
  VideoCall,
  AttachFile,
  EmojiEmotions,
  Circle
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
}

interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isOnline: boolean;
}

interface FloatingChatProps {
  isOpen: boolean;
  onClose: () => void;
}

const FloatingChat: React.FC<FloatingChatProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (isOpen) {
      loadConversations();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiURL}/messages/conversations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      } else {
        // Mock data fallback
        setConversations([
          {
            id: '1',
            participantId: '2',
            participantName: 'Sofia Model',
            participantAvatar: 'https://picsum.photos/200/500',
            lastMessage: '¡Hola! ¿Cómo estás?',
            lastMessageTime: new Date(Date.now() - 5 * 60 * 1000),
            unreadCount: 2,
            isOnline: true
          },
          {
            id: '2',
            participantId: '3',
            participantName: 'Maria Rose',
            participantAvatar: 'https://picsum.photos/200/501',
            lastMessage: 'Gracias por la sesión de ayer',
            lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
            unreadCount: 0,
            isOnline: false
          },
          {
            id: '3',
            participantId: '4',
            participantName: 'Ana Bella',
            participantAvatar: 'https://picsum.photos/200/502',
            lastMessage: '¿Cuándo es tu próxima sesión?',
            lastMessageTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
            unreadCount: 1,
            isOnline: true
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const token = localStorage.getItem('token');
      const conversation = conversations.find(c => c.id === conversationId);
      if (!conversation) return;

      const response = await fetch(`${apiURL}/messages/${conversation.participantId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      } else {
        // Mock messages fallback
        setMessages([
          {
            id: '1',
            senderId: conversation.participantId,
            senderName: conversation.participantName,
            senderAvatar: conversation.participantAvatar,
            content: '¡Hola! ¿Cómo estás?',
            timestamp: new Date(Date.now() - 10 * 60 * 1000),
            isRead: true
          },
          {
            id: '2',
            senderId: user?.id || '1',
            senderName: user?.username || 'Tú',
            senderAvatar: user?.avatar || '/default-avatar.jpg',
            content: '¡Hola! Todo bien, ¿y tú?',
            timestamp: new Date(Date.now() - 8 * 60 * 1000),
            isRead: true
          },
          {
            id: '3',
            senderId: conversation.participantId,
            senderName: conversation.participantName,
            senderAvatar: conversation.participantAvatar,
            content: 'Perfecto, ¿te gustaría tener una sesión privada?',
            timestamp: new Date(Date.now() - 5 * 60 * 1000),
            isRead: false
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const conversation = conversations.find(c => c.id === selectedConversation);
    if (!conversation) return;

    const tempMessage: Message = {
      id: Date.now().toString(),
      senderId: user?.id || '1',
      senderName: user?.username || 'Tú',
      senderAvatar: user?.avatar || '/default-avatar.jpg',
      content: newMessage.trim(),
      timestamp: new Date(),
      isRead: false
    };

    setMessages([...messages, tempMessage]);
    setNewMessage('');

    try {
      const token = localStorage.getItem('token');
      await fetch(`${apiURL}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipientId: conversation.participantId,
          content: tempMessage.content
        })
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'ahora';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  const filteredConversations = conversations.filter(conv =>
    conv.participantName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <Slide direction="up" in={isOpen} mountOnEnter unmountOnExit>
      <Paper
        elevation={8}
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          width: { xs: 'calc(100vw - 40px)', sm: '400px' },
          height: { xs: 'calc(100vh - 40px)', sm: '600px' },
          borderRadius: '12px',
          overflow: 'hidden',
          zIndex: 1300,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'white'
        }}
      >
        {/* Header */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          borderBottom: '1px solid #dbdbdb',
          backgroundColor: 'white'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#262626' }}>
            {selectedConversation ? 
              conversations.find(c => c.id === selectedConversation)?.participantName :
              'Mensajes'
            }
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            {selectedConversation && (
              <>
                <IconButton size="small" sx={{ color: '#262626' }}>
                  <Phone sx={{ fontSize: '20px' }} />
                </IconButton>
                <IconButton size="small" sx={{ color: '#262626' }}>
                  <VideoCall sx={{ fontSize: '20px' }} />
                </IconButton>
                <IconButton size="small" sx={{ color: '#262626' }}>
                  <MoreVert sx={{ fontSize: '20px' }} />
                </IconButton>
              </>
            )}
            <IconButton 
              size="small" 
              onClick={onClose}
              sx={{ color: '#262626' }}
            >
              <Close sx={{ fontSize: '20px' }} />
            </IconButton>
          </Box>
        </Box>

        {!selectedConversation ? (
          /* Conversations List */
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Search */}
            <Box sx={{ p: 2, borderBottom: '1px solid #dbdbdb' }}>
              <TextField
                fullWidth
                placeholder="Buscar conversaciones..."
                variant="outlined"
                size="small"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: '#8e8e8e', fontSize: '20px' }} />
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: '20px',
                    backgroundColor: '#efefef',
                    '& fieldset': { border: 'none' }
                  }
                }}
              />
            </Box>

            {/* Conversations */}
            <List sx={{ flex: 1, overflow: 'auto', p: 0 }}>
              {filteredConversations.map((conversation) => (
                <ListItem
                  key={conversation.id}
                  button
                  onClick={() => setSelectedConversation(conversation.id)}
                  sx={{
                    py: 1.5,
                    px: 2,
                    '&:hover': { backgroundColor: '#f5f5f5' }
                  }}
                >
                  <ListItemAvatar>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      badgeContent={
                        conversation.isOnline ? (
                          <Circle sx={{ color: '#44b700', fontSize: '12px' }} />
                        ) : null
                      }
                    >
                      <Avatar 
                        src={conversation.participantAvatar}
                        alt={conversation.participantName}
                        sx={{ width: 48, height: 48 }}
                      />
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography sx={{ fontWeight: 600, fontSize: '14px', color: '#262626' }}>
                        {conversation.participantName}
                      </Typography>
                    }
                    secondary={
                      <Typography sx={{ fontSize: '13px', color: '#8e8e8e' }}>
                        {conversation.lastMessage}
                      </Typography>
                    }
                  />
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '12px', color: '#8e8e8e' }}>
                      {formatTime(conversation.lastMessageTime)}
                    </Typography>
                    {conversation.unreadCount > 0 && (
                      <Badge
                        badgeContent={conversation.unreadCount}
                        color="error"
                        sx={{
                          '& .MuiBadge-badge': {
                            fontSize: '11px',
                            height: '18px',
                            minWidth: '18px'
                          }
                        }}
                      />
                    )}
                  </Box>
                </ListItem>
              ))}
            </List>
          </Box>
        ) : (
          /* Chat Messages */
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Back Button */}
            <Box sx={{ p: 1, borderBottom: '1px solid #dbdbdb' }}>
              <IconButton 
                onClick={() => setSelectedConversation(null)}
                sx={{ color: '#262626' }}
              >
                ← Volver
              </IconButton>
            </Box>

            {/* Messages */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
              {messages.map((message) => (
                <Box
                  key={message.id}
                  sx={{
                    display: 'flex',
                    justifyContent: message.senderId === user?.id ? 'flex-end' : 'flex-start',
                    mb: 1
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: '70%',
                      p: 1.5,
                      borderRadius: '18px',
                      backgroundColor: message.senderId === user?.id ? '#0095f6' : '#efefef',
                      color: message.senderId === user?.id ? 'white' : '#262626'
                    }}
                  >
                    <Typography sx={{ fontSize: '14px' }}>
                      {message.content}
                    </Typography>
                    <Typography sx={{ 
                      fontSize: '11px', 
                      opacity: 0.7, 
                      mt: 0.5,
                      textAlign: 'right'
                    }}>
                      {formatTime(message.timestamp)}
                    </Typography>
                  </Box>
                </Box>
              ))}
              <div ref={messagesEndRef} />
            </Box>

            {/* Message Input */}
            <Box sx={{ p: 2, borderTop: '1px solid #dbdbdb' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                  fullWidth
                  placeholder="Escribe un mensaje..."
                  variant="outlined"
                  size="small"
                  multiline
                  maxRows={3}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  InputProps={{
                    sx: {
                      borderRadius: '20px',
                      '& fieldset': { borderColor: '#dbdbdb' }
                    },
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" sx={{ color: '#8e8e8e' }}>
                          <EmojiEmotions sx={{ fontSize: '20px' }} />
                        </IconButton>
                        <IconButton size="small" sx={{ color: '#8e8e8e' }}>
                          <AttachFile sx={{ fontSize: '20px' }} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
                <IconButton
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  sx={{
                    backgroundColor: newMessage.trim() ? '#0095f6' : '#dbdbdb',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: newMessage.trim() ? '#1877f2' : '#dbdbdb'
                    },
                    '&:disabled': {
                      color: 'white'
                    }
                  }}
                >
                  <Send sx={{ fontSize: '20px' }} />
                </IconButton>
              </Box>
            </Box>
          </Box>
        )}
      </Paper>
    </Slide>
  );
};

export default FloatingChat;
