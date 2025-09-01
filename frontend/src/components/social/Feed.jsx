import React, { useState, useEffect, useCallback } from 'react';
import { useInfiniteQuery } from 'react-query';
import { useInView } from 'react-intersection-observer';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import Post from './Post';
import PostForm from './PostForm';
import Spinner from '../common/Spinner';

const Feed = ({ userId, showCreatePost = true }) => {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [ref, inView] = useInView();
  
  // Fetch posts with infinite scroll
  const fetchPosts = async ({ pageParam = 1 }) => {
    try {
      const response = await api.get('/posts', {
        params: {
          page: pageParam,
          limit: 5,
          ...(userId && { userId })
        }
      });
      
      return response.data;
    } catch (err) {
      console.error('Error fetching posts:', err);
      throw new Error('Error al cargar las publicaciones');
    }
  };
  
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    refetch
  } = useInfiniteQuery(
    ['posts', userId],
    fetchPosts,
    {
      getNextPageParam: (lastPage, pages) => {
        if (lastPage.pagination && lastPage.pagination.next) {
          return pages.length + 1;
        }
        return undefined;
      },
      onSuccess: (data) => {
        // Flatten the pages array to get all posts
        const allPosts = data.pages.flatMap(page => page.data || []);
        setPosts(allPosts);
        
        // Check if there are more pages to load
        const lastPage = data.pages[data.pages.length - 1];
        setHasMore(!!lastPage.pagination?.next);
      },
      onError: (err) => {
        setError(err.message);
      },
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
  
  // Load more posts when the user scrolls to the bottom
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);
  
  // Handle post creation
  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
  };
  
  // Handle post update
  const handlePostUpdated = (updatedPost) => {
    setPosts(prev => 
      prev.map(post => 
        post.id === updatedPost.id ? { ...post, ...updatedPost } : post
      )
    );
  };
  
  // Handle post deletion
  const handlePostDeleted = (postId) => {
    setPosts(prev => prev.filter(post => post.id !== postId));
  };
  
  // Handle like/unlike
  const handlePostLiked = (postId, liked) => {
    setPosts(prev => 
      prev.map(post => {
        if (post.id === postId) {
          const likes = liked 
            ? [...(post.likes || []), { userId: user.id }]
            : (post.likes || []).filter(like => like.userId !== user.id);
            
          return {
            ...post,
            likes,
            _count: {
              ...post._count,
              likes: liked ? post._count.likes + 1 : Math.max(0, post._count.likes - 1)
            }
          };
        }
        return post;
      })
    );
  };
  
  // Handle comment count update
  const handleCommentCountUpdate = (postId, delta) => {
    setPosts(prev => 
      prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            _count: {
              ...post._count,
              comments: post._count.comments + delta
            }
          };
        }
        return post;
      })
    );
  };
  
  // Loading state
  if (status === 'loading' && posts.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }
  
  // Error state
  if (status === 'error') {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Reintentar
        </button>
      </div>
    );
  }
  
  // Empty state
  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          {userId ? 'No hay publicaciones' : 'No hay publicaciones para mostrar'}
        </h3>
        <p className="text-gray-500 mb-4">
          {userId 
            ? 'Este usuario aún no ha compartido ninguna publicación.'
            : 'Sigue a más usuarios para ver sus publicaciones aquí.'
          }
        </p>
        {!userId && showCreatePost && (
          <button
            onClick={() => document.getElementById('create-post')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Crear primera publicación
          </button>
        )}
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Create Post Form */}
      {showCreatePost && !userId && (
        <div id="create-post" className="mb-6">
          <PostForm onPostCreated={handlePostCreated} />
        </div>
      )}
      
      {/* Posts List */}
      <div className="space-y-6">
        {posts.map((post) => (
          <Post
            key={post.id}
            post={post}
            onDelete={handlePostDeleted}
            onUpdate={handlePostUpdated}
            onLikeToggled={(liked) => handlePostLiked(post.id, liked)}
            onCommentAdded={() => handleCommentCountUpdate(post.id, 1)}
            onCommentDeleted={() => handleCommentCountUpdate(post.id, -1)}
          />
        ))}
      </div>
      
      {/* Loading indicator for infinite scroll */}
      <div ref={ref} className="py-4">
        {isFetchingNextPage ? (
          <div className="flex justify-center">
            <Spinner size="md" />
          </div>
        ) : hasNextPage ? (
          <button
            onClick={() => fetchNextPage()}
            disabled={!hasNextPage || isFetchingNextPage}
            className="w-full py-2 text-sm text-center text-gray-500 hover:text-gray-700"
          >
            Cargar más publicaciones
          </button>
        ) : (
          <p className="text-center text-sm text-gray-500 py-4">
            Has llegado al final
          </p>
        )}
      </div>
    </div>
  );
};

export default Feed;
