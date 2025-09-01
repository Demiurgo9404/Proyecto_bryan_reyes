import React, { useState, useEffect } from 'react';
import { FaUserFriends, FaBell, FaCommentAlt, FaSearch } from 'react-icons/fa';
import Stories from './Stories';
import CreatePost from './CreatePost';
import Post from './Post';
import { motion } from 'framer-motion';

const SocialFeed = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  
  // Datos de ejemplo para el feed
  useEffect(() => {
    // Simular carga de publicaciones
    const fetchPosts = async () => {
      try {
        // En una aplicación real, esto sería una llamada a la API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockPosts = [
          {
            id: 1,
            userName: 'Ana García',
            userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=64&h=64&q=80',
            timeAgo: 'Hace 2 horas',
            content: '¡Hola a todos! Estoy muy emocionada de compartir con ustedes mi nuevo set de fotos. ¡Espero que les guste! 😊',
            image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=facearea&w=1000&q=80',
            likes: 245,
            comments: [
              {
                id: 1,
                user: 'Carlos López',
                avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=32&h=32&q=80',
                text: '¡Increíble sesión de fotos! Eres hermosa 😍',
                time: 'Hace 1 hora'
              },
              {
                id: 2,
                user: 'María Rodríguez',
                avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=32&h=32&q=80',
                text: '¡Me encanta! ¿Dónde fue la sesión?',
                time: 'Hace 45 minutos'
              }
            ],
            shares: 12
          },
          {
            id: 2,
            userName: 'Carlos López',
            userAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=64&h=64&q=80',
            timeAgo: 'Ayer a las 14:30',
            content: '¡Increíble sesión de fotos hoy! Pronto les compartiré las mejores tomas. #Fotografía #Modelaje',
            video: 'https://example.com/video1.mp4',
            videoThumbnail: 'https://images.unsplash.com/photo-1571902943201-8ec2d4ba3d75?ixlib=rb-1.2.1&auto=format&fit=facearea&w=1000&q=80',
            likes: 189,
            comments: [],
            shares: 5
          },
          {
            id: 3,
            userName: 'María Rodríguez',
            userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=64&h=64&q=80',
            timeAgo: 'Ayer a las 10:15',
            content: '¡Hoy es un gran día! Acabo de alcanzar los 50k seguidores en la plataforma. ¡Gracias a todos por su apoyo! ❤️',
            image: 'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?ixlib=rb-1.2.1&auto=format&fit=facearea&w=1000&q=80',
            likes: 432,
            comments: [
              {
                id: 3,
                user: 'Juan Pérez',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=32&h=32&q=80',
                text: '¡Felicidades! Se lo merece, su contenido es increíble.',
                time: 'Ayer a las 10:30'
              }
            ],
            shares: 28
          }
        ];
        
        setPosts(mockPosts);
      } catch (error) {
        console.error('Error al cargar publicaciones:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPosts();
  }, []);
  
  const handleCreatePost = async (postData) => {
    setIsPosting(true);
    
    try {
      // Simular envío a la API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newPost = {
        id: Date.now(),
        userName: 'Tú',
        userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=64&h=64&q=80',
        timeAgo: 'Ahora mismo',
        content: postData.content,
        image: postData.image,
        video: postData.video,
        likes: 0,
        comments: [],
        shares: 0
      };
      
      setPosts(prevPosts => [newPost, ...prevPosts]);
    } catch (error) {
      console.error('Error al crear la publicación:', error);
      alert('No se pudo publicar. Inténtalo de nuevo.');
    } finally {
      setIsPosting(false);
    }
  };
  
  const handleLike = (postId, liked) => {
    // En una aplicación real, esto actualizaría el servidor
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? { ...post, likes: liked ? post.likes + 1 : Math.max(0, post.likes - 1) }
          : post
      )
    );
  };
  
  const handleComment = (postId, commentText) => {
    // En una aplicación real, esto enviaría el comentario al servidor
    const newComment = {
      id: Date.now(),
      user: 'Tú',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=32&h=32&q=80',
      text: commentText,
      time: 'Ahora mismo'
    };
    
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? { 
              ...post, 
              comments: [...post.comments, newComment],
              commentsCount: (post.commentsCount || post.comments.length) + 1
            }
          : post
      )
    );
  };
  
  const handleShare = (postId) => {
    // En una aplicación real, esto abriría un diálogo para compartir
    console.log('Compartiendo publicación:', postId);
    
    // Actualizar contador de compartidos
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? { ...post, shares: (post.shares || 0) + 1 }
          : post
      )
    );
  };
  
  // Datos de ejemplo para el usuario actual
  const currentUser = {
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=64&h=64&q=80',
    name: 'Tú',
    isOnline: true
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Historias */}
      <Stories />
      
      {/* Crear publicación */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <CreatePost 
          userAvatar={currentUser.avatar} 
          onPost={handleCreatePost}
          isSubmitting={isPosting}
        />
      </motion.div>
      
      {/* Lista de publicaciones */}
      <div className="space-y-6">
        {isLoading ? (
          // Mostrar esqueletos de carga
          Array(3).fill(0).map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-4 animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                    <div className="h-3 bg-gray-100 rounded w-24"></div>
                  </div>
                </div>
                <div className="mt-3 h-4 bg-gray-100 rounded w-full"></div>
                <div className="mt-2 h-4 bg-gray-100 rounded w-3/4"></div>
                <div className="mt-4 h-64 bg-gray-100 rounded-lg"></div>
              </div>
            </div>
          ))
        ) : (
          // Mostrar publicaciones
          posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Post 
                post={post} 
                onLike={handleLike}
                onComment={handleComment}
                onShare={handleShare}
              />
            </motion.div>
          ))
        )}
        
        {!isLoading && posts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <FaUserFriends className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No hay publicaciones</h3>
            <p className="text-gray-500">Sigue a otros usuarios para ver sus publicaciones aquí.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialFeed;
