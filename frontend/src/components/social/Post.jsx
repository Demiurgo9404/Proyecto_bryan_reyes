import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { FaHeart, FaRegHeart, FaComment, FaShare, FaEllipsisH, FaBookmark, FaRegBookmark } from 'react-icons/fa';
import { BiMessageRounded } from 'react-icons/bi';
import { BsEmojiSmile, BsThreeDots } from 'react-icons/bs';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import Avatar from '../common/Avatar';
import CommentSection from './CommentSection';

const Post = ({ post, onDelete, onUpdate, showFullContent = false }) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
  const [showComments, setShowComments] = useState(false);
  const [commentsCount, setCommentsCount] = useState(post.comments?.length || 0);
  const [isSaved, setIsSaved] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showOptions, setShowOptions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content || '');
  const [isDeleting, setIsDeleting] = useState(false);

  // Check if the current user has liked the post
  useEffect(() => {
    if (post.likes && user) {
      const userLiked = post.likes.some(like => like.userId === user.id);
      setIsLiked(userLiked);
    }
  }, [post.likes, user]);

  // Check if the post is saved by the current user
  useEffect(() => {
    // TODO: Implement saved posts functionality
    // This would typically check against a user's saved posts array
  }, [user, post.id]);

  const handleLike = async () => {
    try {
      await api.post(`/posts/${post.id}/like`);
      
      if (isLiked) {
        setLikesCount(prev => prev - 1);
      } else {
        setLikesCount(prev => prev + 1);
        
        // Show animation for new like
        const likeButton = document.getElementById(`like-${post.id}`);
        if (likeButton) {
          likeButton.classList.add('animate-ping');
          setTimeout(() => {
            likeButton.classList.remove('animate-ping');
          }, 300);
        }
      }
      
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const toggleComments = () => {
    setShowComments(!showComments);
  };

  const handleSave = async () => {
    try {
      // TODO: Implement save post functionality
      // await api.post(`/posts/${post.id}/save`);
      setIsSaved(!isSaved);
    } catch (error) {
      console.error('Error saving post:', error);
    }
  };

  const handleNextImage = () => {
    if (post.images && post.images.length > 0) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === post.images.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const handlePrevImage = () => {
    if (post.images && post.images.length > 0) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === 0 ? post.images.length - 1 : prevIndex - 1
      );
    }
  };

  const handleEdit = () => {
    setEditedContent(post.content);
    setIsEditing(true);
    setShowOptions(false);
  };

  const handleSaveEdit = async () => {
    try {
      await api.put(`/posts/${post.id}`, { content: editedContent });
      onUpdate && onUpdate({ ...post, content: editedContent });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta publicación?')) {
      try {
        setIsDeleting(true);
        await api.delete(`/posts/${post.id}`);
        onDelete && onDelete(post.id);
      } catch (error) {
        console.error('Error deleting post:', error);
        setIsDeleting(false);
      }
    }
  };

  const formatDate = (dateString) => {
    return formatDistanceToNow(new Date(dateString), { 
      addSuffix: true,
      locale: es 
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden border border-gray-100">
      {/* Post Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <Link to={`/profile/${post.author?.username || post.userId}`}>
            <Avatar 
              src={post.author?.profileImageUrl} 
              alt={post.author?.fullName || 'Usuario'}
              size="md"
            />
          </Link>
          <div>
            <Link 
              to={`/profile/${post.author?.username || post.userId}`}
              className="font-semibold text-sm hover:underline"
            >
              {post.author?.username || 'usuario'}
            </Link>
            {post.location && (
              <p className="text-xs text-gray-500">{post.location}</p>
            )}
          </div>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setShowOptions(!showOptions)}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <BsThreeDots />
          </button>
          
          {showOptions && (
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-100">
              {user && user.id === post.userId && (
                <>
                  <button 
                    onClick={handleEdit}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Editar publicación
                  </button>
                  <button 
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 disabled:opacity-50"
                  >
                    {isDeleting ? 'Eliminando...' : 'Eliminar publicación'}
                  </button>
                </>
              )}
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
                  setShowOptions(false);
                  // Show copied to clipboard message
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Copiar enlace
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Post Content */}
      <div className="relative">
        {/* Post Images */}
        {post.images && post.images.length > 0 && (
          <div className="relative w-full aspect-square bg-black">
            <img 
              src={post.images[currentImageIndex]?.imageUrl} 
              alt={`Publicación de ${post.author?.username || 'usuario'}`}
              className="w-full h-full object-cover"
            />
            
            {/* Image navigation arrows */}
            {post.images.length > 1 && (
              <>
                <button 
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2"
                  aria-label="Imagen anterior"
                >
                  &larr;
                </button>
                <button 
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2"
                  aria-label="Siguiente imagen"
                >
                  &rarr;
                </button>
              </>
            )}
            
            {/* Image indicators */}
            <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-2">
              {post.images.map((_, index) => (
                <span 
                  key={index}
                  className={`h-2 w-2 rounded-full ${index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'}`}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Post Actions */}
        <div className="p-3">
          <div className="flex justify-between mb-2">
            <div className="flex space-x-4">
              <button 
                id={`like-${post.id}`}
                onClick={handleLike}
                className="focus:outline-none"
                aria-label={isLiked ? 'Quitar me gusta' : 'Me gusta'}
              >
                {isLiked ? (
                  <FaHeart className="text-red-500 text-2xl" />
                ) : (
                  <FaRegHeart className="text-2xl" />
                )}
              </button>
              <button 
                onClick={toggleComments}
                className="focus:outline-none"
                aria-label="Comentar"
              >
                <BiMessageRounded className="text-2xl" />
              </button>
              <button 
                className="focus:outline-none"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
                  // Show copied to clipboard message
                }}
                aria-label="Compartir"
              >
                <FaShare className="text-xl mt-0.5" />
              </button>
            </div>
            <button 
              onClick={handleSave}
              className="focus:outline-none"
              aria-label={isSaved ? 'Quitar de guardados' : 'Guardar'}
            >
              {isSaved ? (
                <FaBookmark className="text-yellow-500 text-xl" />
              ) : (
                <FaRegBookmark className="text-xl" />
              )}
            </button>
          </div>
          
          {/* Likes count */}
          {likesCount > 0 && (
            <div className="mb-1">
              <p className="text-sm font-semibold">{likesCount} me gusta</p>
            </div>
          )}
          
          {/* Post content */}
          <div className="mb-1">
            {isEditing ? (
              <div className="mb-2">
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
                <div className="flex justify-end space-x-2 mt-2">
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleSaveEdit}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm">
                <Link 
                  to={`/profile/${post.author?.username || post.userId}`}
                  className="font-semibold hover:underline mr-1"
                >
                  {post.author?.username || 'usuario'}
                </Link>
                {post.content}
              </p>
            )}
          </div>
          
          {/* View all comments */}
          {commentsCount > 0 && !showComments && (
            <button 
              onClick={toggleComments}
              className="text-sm text-gray-500 mb-1 hover:underline focus:outline-none"
            >
              Ver los {commentsCount} {commentsCount === 1 ? 'comentario' : 'comentarios'}
            </button>
          )}
          
          {/* Post time */}
          <p className="text-xs text-gray-400 uppercase">
            {formatDate(post.createdAt)}
          </p>
          
          {/* Add comment */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center">
              <BsEmojiSmile className="text-xl text-gray-400 mr-3" />
              <input
                type="text"
                placeholder="Añade un comentario..."
                className="flex-1 text-sm focus:outline-none"
                onFocus={() => setShowComments(true)}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-gray-100">
          <CommentSection 
            postId={post.id} 
            initialComments={post.comments}
            onCommentAdded={() => setCommentsCount(prev => prev + 1)}
          />
        </div>
      )}
    </div>
  );
};

export default Post;
