import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  TextField,
  IconButton,
  Paper,
  Badge,
  Divider,
  InputAdornment,
  Chip,
} from '@mui/material';
import {
  Send,
  Search,
  MoreVert,
  Phone,
  VideoCall,
  Info,
  EmojiEmotions,
  AttachFile,
  Favorite,
  Image,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../../contexts/AuthContext';

const MessagesContainer = styled(Box)({
  height: '100vh',
  backgroundColor: '#ffffff',
  display: 'flex',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
});

const ConversationsList = styled(Box)({
  width: '350px',
  borderRight: '1px solid #dbdbdb',
  display: 'flex',
  flexDirection: 'column',
});

const ConversationsHeader = styled(Box)({
  padding: '20px',
  borderBottom: '1px solid #dbdbdb',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

const SearchBox = styled(TextField)({
  margin: '16px',
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    backgroundColor: '#efefef',
    '& fieldset': {
      border: 'none',
    },
  },
});

const ConversationItem = styled(ListItem)({
  padding: '12px 20px',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: '#f5f5f5',
  },
  '&.active': {
    backgroundColor: '#e3f2fd',
  },
});

const ChatArea = styled(Box)({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
});

const ChatHeader = styled(Box)({
  padding: '16px 20px',
  borderBottom: '1px solid #dbdbdb',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: '#ffffff',
});

const ChatMessages = styled(Box)({
  flex: 1,
  padding: '20px',
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
});

const MessageBubble = styled(Box)<{ isOwn?: boolean }>(({ isOwn }) => ({
  maxWidth: '70%',
  alignSelf: isOwn ? 'flex-end' : 'flex-start',
  backgroundColor: isOwn ? '#0095f6' : '#efefef',
  color: isOwn ? '#ffffff' : '#262626',
  padding: '8px 16px',
  borderRadius: '18px',
  fontSize: '14px',
  lineHeight: 1.4,
}));

const MessageInput = styled(Box)({
  padding: '16px 20px',
  borderTop: '1px solid #dbdbdb',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
});

const MessageTextField = styled(TextField)({
  flex: 1,
  '& .MuiOutlinedInput-root': {
    borderRadius: '22px',
    '& fieldset': {
      border: '1px solid #dbdbdb',
    },
  },
});

const OnlineIndicator = styled(Box)({
  width: '12px',
  height: '12px',
  backgroundColor: '#00c851',
  borderRadius: '50%',
  border: '2px solid #ffffff',
  position: 'absolute',
  bottom: '2px',
  right: '2px',
});

const MessageTime = styled(Typography)({
  fontSize: '11px',
  color: '#8e8e8e',
  marginTop: '4px',
  textAlign: 'center',
});

const EmptyState = styled(Box)({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#8e8e8e',
});

interface Message {
  id: number;
  content: string;
  sender_id: number;
  receiver_id: number;
  created_at: string;
  message_type: 'text' | 'image' | 'video';
  media_url?: string;
}

interface Conversation {
  id: number;
  user: {
    id: number;
    username: string;
    display_name: string;
    avatar: string;
    is_online: boolean;
    last_seen?: string;
  };
  last_message: {
    content: string;
    created_at: string;
    sender_id: number;
  };
  unread_count: number;
}

const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.user.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/messages/conversations`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      } else {
        loadMockConversations();
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      loadMockConversations();
    } finally {
      setIsLoading(false);
    }
  };

  const loadMockConversations = () => {
    const mockConversations: Conversation[] = [
      {
        id: 1,
        user: {
          id: 1,
          username: 'emma_model',
          display_name: 'Emma Wilson',
          avatar: '/api/placeholder/40/40',
          is_online: true,
        },
        last_message: {
          content: 'Hey! How are you doing? 😊',
          created_at: '2024-01-15T14:30:00Z',
          sender_id: 1,
        },
        unread_count: 2,
      },
      {
        id: 2,
        user: {
          id: 2,
          username: 'sofia_dance',
          display_name: 'Sofia Rodriguez',
          avatar: '/api/placeholder/40/40',
          is_online: false,
          last_seen: '2024-01-15T12:00:00Z',
        },
        last_message: {
          content: 'Thanks for the video call! 💕',
          created_at: '2024-01-15T10:15:00Z',
          sender_id: 2,
        },
        unread_count: 0,
      },
      {
        id: 3,
        user: {
          id: 3,
          username: 'maria_art',
          display_name: 'Maria Garcia',
          avatar: '/api/placeholder/40/40',
          is_online: true,
        },
        last_message: {
          content: 'Love your latest post!',
          created_at: '2024-01-14T18:45:00Z',
          sender_id: 3,
        },
        unread_count: 1,
      },
    ];

    setConversations(mockConversations);
  };

  const loadMessages = async (userId: number) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/messages/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      } else {
        loadMockMessages(userId);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      loadMockMessages(userId);
    }
  };

  const loadMockMessages = (userId: number) => {
    const mockMessages: Message[] = [
      {
        id: 1,
        content: 'Hi there! 👋',
        sender_id: userId,
        receiver_id: user?.id || 0,
        created_at: '2024-01-15T14:00:00Z',
        message_type: 'text',
      },
      {
        id: 2,
        content: 'Hey! How are you doing?',
        sender_id: user?.id || 0,
        receiver_id: userId,
        created_at: '2024-01-15T14:05:00Z',
        message_type: 'text',
      },
      {
        id: 3,
        content: 'I\'m doing great! Just finished a photoshoot 📸',
        sender_id: userId,
        receiver_id: user?.id || 0,
        created_at: '2024-01-15T14:10:00Z',
        message_type: 'text',
      },
      {
        id: 4,
        content: 'That sounds amazing! Would love to see some shots',
        sender_id: user?.id || 0,
        receiver_id: userId,
        created_at: '2024-01-15T14:15:00Z',
        message_type: 'text',
      },
      {
        id: 5,
        content: 'Hey! How are you doing? 😊',
        sender_id: userId,
        receiver_id: user?.id || 0,
        created_at: '2024-01-15T14:30:00Z',
        message_type: 'text',
      },
    ];

    setMessages(mockMessages);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const messageData = {
      receiver_id: selectedConversation.user.id,
      content: newMessage,
      message_type: 'text',
    };

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(messageData),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, data.message]);
      } else {
        // Add message optimistically for demo
        const newMsg: Message = {
          id: Date.now(),
          content: newMessage,
          sender_id: user?.id || 0,
          receiver_id: selectedConversation.user.id,
          created_at: new Date().toISOString(),
          message_type: 'text',
        };
        setMessages(prev => [...prev, newMsg]);
      }

      setNewMessage('');
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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.user.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <MessagesContainer>
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <Typography>Loading messages...</Typography>
        </Box>
      </MessagesContainer>
    );
  }

  return (
    <MessagesContainer>
      {/* Conversations List */}
      <ConversationsList>
        <ConversationsHeader>
          <Typography variant="h6" sx={{ fontWeight: '600', color: '#262626' }}>
            Messages
          </Typography>
          <IconButton>
            <MoreVert />
          </IconButton>
        </ConversationsHeader>

        <SearchBox
          placeholder="Search messages"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: '#8e8e8e' }} />
              </InputAdornment>
            ),
          }}
        />

        <List sx={{ flex: 1, overflow: 'auto', padding: 0 }}>
          {filteredConversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              className={selectedConversation?.id === conversation.id ? 'active' : ''}
              onClick={() => setSelectedConversation(conversation)}
            >
              <ListItemAvatar>
                <Box position="relative">
                  <Avatar src={conversation.user.avatar} />
                  {conversation.user.is_online && <OnlineIndicator />}
                </Box>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography variant="subtitle2" sx={{ fontWeight: '600' }}>
                      {conversation.user.display_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatTime(conversation.last_message.created_at)}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '200px',
                      }}
                    >
                      {conversation.last_message.content}
                    </Typography>
                    {conversation.unread_count > 0 && (
                      <Badge
                        badgeContent={conversation.unread_count}
                        color="primary"
                        sx={{
                          '& .MuiBadge-badge': {
                            fontSize: '11px',
                            minWidth: '18px',
                            height: '18px',
                          },
                        }}
                      />
                    )}
                  </Box>
                }
              />
            </ConversationItem>
          ))}
        </List>
      </ConversationsList>

      {/* Chat Area */}
      <ChatArea>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <ChatHeader>
              <Box display="flex" alignItems="center">
                <Avatar src={selectedConversation.user.avatar} sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: '600' }}>
                    {selectedConversation.user.display_name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {selectedConversation.user.is_online 
                      ? 'Active now' 
                      : `Active ${formatTime(selectedConversation.user.last_seen || '')}`
                    }
                  </Typography>
                </Box>
              </Box>
              <Box display="flex" gap={1}>
                <IconButton color="primary">
                  <Phone />
                </IconButton>
                <IconButton color="primary">
                  <VideoCall />
                </IconButton>
                <IconButton>
                  <Info />
                </IconButton>
              </Box>
            </ChatHeader>

            {/* Messages */}
            <ChatMessages>
              {messages.map((message, index) => {
                const isOwn = message.sender_id === user?.id;
                const showTime = index === 0 || 
                  new Date(message.created_at).getTime() - new Date(messages[index - 1].created_at).getTime() > 300000; // 5 minutes

                return (
                  <Box key={message.id}>
                    {showTime && (
                      <MessageTime>
                        {formatTime(message.created_at)}
                      </MessageTime>
                    )}
                    <MessageBubble isOwn={isOwn}>
                      {message.content}
                    </MessageBubble>
                  </Box>
                );
              })}
              <div ref={messagesEndRef} />
            </ChatMessages>

            {/* Message Input */}
            <MessageInput>
              <IconButton>
                <AttachFile />
              </IconButton>
              <MessageTextField
                placeholder="Message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                multiline
                maxRows={4}
              />
              <IconButton>
                <EmojiEmotions />
              </IconButton>
              <IconButton 
                color="primary" 
                onClick={sendMessage}
                disabled={!newMessage.trim()}
              >
                <Send />
              </IconButton>
            </MessageInput>
          </>
        ) : (
          <EmptyState>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Your Messages
            </Typography>
            <Typography variant="body2">
              Send private photos and messages to a friend or group
            </Typography>
          </EmptyState>
        )}
      </ChatArea>
    </MessagesContainer>
  );
};

export default MessagesPage;
