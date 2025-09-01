import React, { useState } from 'react';
import { FaThumbsUp, FaComment, FaShare, FaEllipsisH, FaSmile, FaImage, FaVideo } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const Comment = ({ comment }) => (
  <div className="flex space-x-2 mt-2">
    <img 
      src={comment.avatar} 
      alt={comment.user} 
      className="w-8 h-8 rounded-full object-cover"
    />
    <div className="flex-1">
      <div className="bg-gray-100 rounded-2xl px-3 py-2">
        <p className="font-medium text-sm">{comment.user}</p>
        <p className="text-sm">{comment.text}</p>
      </div>
      <div className="flex items-center text-xs text-gray-500 space-x-3 ml-3 mt-1">
        <span>Me gusta</span>
        <span>Responder</span>
        <span>{comment.time}</span>
      </div>
    </div>
  </div>
);

const Post = ({ post, onLike, onComment, onShare }) => {
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [localLikes, setLocalLikes] = useState(post.likes);
  const [comments, setComments] = useState(post.comments || []);

  const handleLike = () => {
    const newLikeStatus = !isLiked;
    setIsLiked(newLikeStatus);
    setLocalLikes(newLikeStatus ? localLikes + 1 : localLikes - 1);
    
    if (onLike) {
      onLike(post.id, newLikeStatus);
    }
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    const newComment = {
      id: Date.now(),
      user: 'Tú',
      avatar: post.userAvatar,
      text: commentText,
      time: 'Ahora mismo',
    };
    
    setComments([...comments, newComment]);
    setCommentText('');
    
    if (onComment) {
      onComment(post.id, commentText);
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare(post.id);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
      {/* Encabezado del post */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src={post.userAvatar} 
              alt={post.userName} 
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h4 className="font-semibold text-gray-900">{post.userName}</h4>
              <p className="text-xs text-gray-500">{post.timeAgo}</p>
            </div>
          </div>
          <button className="text-gray-500 hover:bg-gray-100 p-2 rounded-full">
            <FaEllipsisH />
          </button>
        </div>
        
        {/* Contenido del post */}
        <div className="mt-3">
          <p className="text-gray-800">{post.content}</p>
          
          {post.image && (
            <div className="mt-3 rounded-lg overflow-hidden">
              <img 
                src={post.image} 
                alt="Publicación" 
                className="w-full max-h-96 object-cover"
              />
            </div>
          )}
          
          {post.video && (
            <div className="mt-3 rounded-lg overflow-hidden bg-black">
              <video 
                src={post.video} 
                className="w-full max-h-96" 
                controls
                poster={post.videoThumbnail}
              />
            </div>
          )}
        </div>
        
        {/* Estadísticas */}
        <div className="mt-3 flex items-center justify-between text-sm text-gray-500 border-b border-gray-100 pb-2">
          <div className="flex items-center space-x-1">
            <div className="flex -space-x-1">
              {[1, 2, 3].slice(0, 3).map((i) => (
                <div key={i} className="w-5 h-5 rounded-full bg-pink-500 border-2 border-white"></div>
              ))}
            </div>
            <span>{localLikes.toLocaleString()} me gusta</span>
          </div>
          <div>
            <span>{comments.length} comentarios</span>
            <span className="mx-1">·</span>
            <span>{post.shares} compartidos</span>
          </div>
        </div>
        
        {/* Acciones */}
        <div className="grid grid-cols-3 py-1 text-center text-gray-500 text-sm">
          <button 
            className={`flex items-center justify-center space-x-2 py-2 rounded-lg hover:bg-gray-100 ${isLiked ? 'text-pink-500' : ''}`}
            onClick={handleLike}
          >
            <FaThumbsUp className="text-lg" />
            <span>Me gusta</span>
          </button>
          <button 
            className="flex items-center justify-center space-x-2 py-2 rounded-lg hover:bg-gray-100"
            onClick={() => setShowComments(!showComments)}
          >
            <FaComment className="text-lg" />
            <span>Comentar</span>
          </button>
          <button 
            className="flex items-center justify-center space-x-2 py-2 rounded-lg hover:bg-gray-100"
            onClick={handleShare}
          >
            <FaShare className="text-lg" />
            <span>Compartir</span>
          </button>
        </div>
      </div>
      
      {/* Sección de comentarios */}
      <AnimatePresence>
        {showComments && (
          <motion.div 
            className="border-t border-gray-100 p-4 bg-gray-50"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Lista de comentarios */}
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
              {comments.map((comment) => (
                <Comment key={comment.id} comment={comment} />
              ))}
              
              {comments.length === 0 && (
                <p className="text-center text-gray-500 text-sm py-4">
                  Sé el primero en comentar
                </p>
              )}
            </div>
            
            {/* Formulario de comentario */}
            <form onSubmit={handleAddComment} className="mt-3 flex items-center space-x-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  className="w-full pl-4 pr-10 py-2 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Escribe un comentario..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                  <button type="button" className="text-gray-400 hover:text-pink-500">
                    <FaImage />
                  </button>
                  <button type="button" className="text-gray-400 hover:text-pink-500">
                    <FaSmile />
                  </button>
                </div>
              </div>
              <button 
                type="submit" 
                className="px-4 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
                disabled={!commentText.trim()}
              >
                Enviar
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Post;
