import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { FaHeart, FaRegHeart, FaReply, FaEllipsisH } from 'react-icons/fa';
import { BsEmojiSmile } from 'react-icons/bs';
import api from '../../services/api';
import Avatar from '../common/Avatar';

const CommentSection = ({ postId, initialComments = [], onCommentAdded }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [showReplies, setShowReplies] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const commentInputRef = useRef(null);

  useEffect(() => {
    // If initialComments were passed, use them, otherwise fetch comments
    if (initialComments.length === 0) {
      fetchComments();
    }
  }, [postId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/comments/post/${postId}?limit=50`);
      setComments(response.data.data || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Error al cargar los comentarios');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    try {
      const commentData = {
        content: newComment,
        postId,
        parentId: replyingTo?.commentId || null
      };
      
      const response = await api.post('/comments', commentData);
      const newCommentData = response.data.data;
      
      if (replyingTo) {
        // Add as a reply to the parent comment
        setComments(prev => prev.map(comment => {
          if (comment.id === replyingTo.commentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), newCommentData],
              _count: {
                ...comment._count,
                replies: (comment._count?.replies || 0) + 1
              }
            };
          }
          return comment;
        }));
      } else {
        // Add as a top-level comment
        setComments(prev => [newCommentData, ...prev]);
      }
      
      setNewComment('');
      setReplyingTo(null);
      onCommentAdded && onCommentAdded();
      
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Error al publicar el comentario');
    }
  };

  const toggleLike = async (commentId) => {
    try {
      await api.post(`/comments/${commentId}/like`);
      
      // Update the UI to reflect the like
      setComments(prev => prev.map(comment => {
        // Update the comment or its replies
        if (comment.id === commentId) {
          const isLiked = comment.isLikedByCurrentUser;
          return {
            ...comment,
            isLikedByCurrentUser: !isLiked,
            _count: {
              ...comment._count,
              likes: isLiked ? comment._count.likes - 1 : comment._count.likes + 1
            }
          };
        }
        
        // Check if any reply matches
        if (comment.replies && comment.replies.some(reply => reply.id === commentId)) {
          return {
            ...comment,
            replies: comment.replies.map(reply => {
              if (reply.id === commentId) {
                const isLiked = reply.isLikedByCurrentUser;
                return {
                  ...reply,
                  isLikedByCurrentUser: !isLiked,
                  _count: {
                    ...reply._count,
                    likes: isLiked ? reply._count.likes - 1 : reply._count.likes + 1
                  }
                };
              }
              return reply;
            })
          };
        }
        
        return comment;
      }));
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  const toggleReplies = (commentId) => {
    setShowReplies(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  const formatDate = (dateString) => {
    return formatDistanceToNow(new Date(dateString), { 
      addSuffix: true,
      locale: es 
    });
  };

  const CommentItem = ({ comment, isReply = false }) => {
    const [showOptions, setShowOptions] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(comment.content);
    const [isDeleting, setIsDeleting] = useState(false);
    
    const handleUpdateComment = async () => {
      try {
        await api.put(`/comments/${comment.id}`, { content: editedContent });
        setIsEditing(false);
        
        // Update the comment in the UI
        setComments(prev => prev.map(c => 
          c.id === comment.id 
            ? { ...c, content: editedContent, updatedAt: new Date().toISOString() } 
            : c
        ));
      } catch (err) {
        console.error('Error updating comment:', err);
      }
    };
    
    const handleDeleteComment = async () => {
      if (window.confirm('¿Estás seguro de que deseas eliminar este comentario?')) {
        try {
          setIsDeleting(true);
          await api.delete(`/comments/${comment.id}`);
          
          // Remove the comment from the UI
          setComments(prev => prev.filter(c => c.id !== comment.id));
          onCommentAdded && onCommentAdded(-1); // Decrement comment count
        } catch (err) {
          console.error('Error deleting comment:', err);
          setIsDeleting(false);
        }
      }
    };

    return (
      <div className={`flex space-x-3 ${isReply ? 'ml-10 mt-3' : 'my-3'}`}>
        <Avatar 
          src={comment.author?.profileImageUrl} 
          alt={comment.author?.username || 'Usuario'}
          size="sm"
        />
        
        <div className="flex-1">
          <div className="bg-gray-50 rounded-2xl p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <span className="font-semibold text-sm">
                  {comment.author?.username || 'usuario'}
                </span>
                {comment.isEdited && (
                  <span className="text-xs text-gray-400">(editado)</span>
                )}
              </div>
              
              {user && user.id === comment.userId && (
                <div className="relative">
                  <button 
                    onClick={() => setShowOptions(!showOptions)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FaEllipsisH size={14} />
                  </button>
                  
                  {showOptions && (
                    <div className="absolute right-0 mt-1 w-40 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                      <button 
                        onClick={() => {
                          setIsEditing(true);
                          setShowOptions(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={handleDeleteComment}
                        disabled={isDeleting}
                        className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 disabled:opacity-50"
                      >
                        {isDeleting ? 'Eliminando...' : 'Eliminar'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {isEditing ? (
              <div className="mt-1">
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full p-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  rows="2"
                  autoFocus
                />
                <div className="flex justify-end space-x-2 mt-1">
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="px-2 py-1 text-xs text-gray-700 hover:bg-gray-100 rounded"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleUpdateComment}
                    className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm mt-1">{comment.content}</p>
            )}
            
            <div className="flex items-center mt-1 space-x-4">
              <button 
                onClick={() => toggleLike(comment.id)}
                className={`text-xs ${comment.isLikedByCurrentUser ? 'text-red-500 font-semibold' : 'text-gray-500'}`}
              >
                {comment.isLikedByCurrentUser ? 'No me gusta' : 'Me gusta'}
              </button>
              
              {!isReply && (
                <button 
                  onClick={() => {
                    setReplyingTo({
                      commentId: comment.id,
                      username: comment.author?.username
                    });
                    commentInputRef.current?.focus();
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Responder
                </button>
              )}
              
              <span className="text-xs text-gray-400">
                {formatDate(comment.createdAt)}
              </span>
            </div>
            
            {comment._count?.likes > 0 && (
              <div className="flex items-center mt-1">
                <FaHeart className="text-red-500 text-xs mr-1" />
                <span className="text-xs text-gray-500">
                  {comment._count.likes}
                </span>
              </div>
            )}
          </div>
          
          {/* Replies */}
          {!isReply && comment._count?.replies > 0 && (
            <div className="mt-2">
              <button 
                onClick={() => toggleReplies(comment.id)}
                className="text-xs text-blue-500 hover:underline flex items-center"
              >
                {showReplies[comment.id] ? 'Ocultar respuestas' : `Ver ${comment._count.replies} ${comment._count.replies === 1 ? 'respuesta' : 'respuestas'}`}
              </button>
              
              {showReplies[comment.id] && comment.replies?.map(reply => (
                <CommentItem 
                  key={reply.id} 
                  comment={reply} 
                  isReply={true} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-3 max-h-96 overflow-y-auto">
      {loading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <p className="text-red-500 text-sm text-center py-4">{error}</p>
      ) : comments.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-4">
          Sé el primero en comentar
        </p>
      ) : (
        <div className="space-y-2">
          {comments.map(comment => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      )}
      
      {/* Add Comment Form */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        {replyingTo && (
          <div className="flex items-center justify-between bg-blue-50 p-2 rounded-t-md">
            <p className="text-xs text-blue-600">
              Respondiendo a @{replyingTo.username}
            </p>
            <button 
              onClick={() => setReplyingTo(null)}
              className="text-xs text-blue-600 hover:underline"
            >
              Cancelar
            </button>
          </div>
        )}
        
        <form onSubmit={handleSubmitComment} className="flex items-center mt-2">
          <Avatar 
            src={user?.profileImageUrl} 
            alt={user?.username || 'Tú'}
            size="sm"
          />
          
          <div className="flex-1 flex items-center ml-2 bg-gray-50 rounded-full px-3">
            <input
              ref={commentInputRef}
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={replyingTo ? `Responder a @${replyingTo.username}...` : 'Añade un comentario...'}
              className="flex-1 bg-transparent border-none focus:outline-none text-sm py-2"
            />
            <button type="button" className="text-gray-400 hover:text-gray-600">
              <BsEmojiSmile />
            </button>
          </div>
          
          <button 
            type="submit" 
            disabled={!newComment.trim()}
            className={`ml-2 text-sm font-semibold ${newComment.trim() ? 'text-blue-500' : 'text-blue-300'} px-3 py-1`}
          >
            Publicar
          </button>
        </form>
      </div>
    </div>
  );
};

export default CommentSection;
