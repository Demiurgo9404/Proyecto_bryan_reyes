import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../services/api';

// Hook para obtener publicaciones
export const usePosts = (userId, options = {}) => {
  const [page, setPage] = useState(1);
  const [limit] = useState(options.limit || 10);
  
  const fetchPosts = async ({ pageParam = 1 }) => {
    const response = await api.get('/posts', {
      params: {
        page: pageParam,
        limit,
        ...(userId && { userId })
      }
    });
    return response.data;
  };
  
  return useInfiniteQuery(
    ['posts', userId],
    fetchPosts,
    {
      getNextPageParam: (lastPage, pages) => {
        if (lastPage.pagination && lastPage.pagination.next) {
          return pages.length + 1;
        }
        return undefined;
      },
      ...options
    }
  );
};

// Hook para crear una publicación
export const useCreatePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    async (formData) => {
      const response = await api.post('/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data.data;
    },
    {
      onSuccess: () => {
        // Invalidate and refetch
        queryClient.invalidateQueries('posts');
      }
    }
  );
};

// Hook para actualizar una publicación
export const useUpdatePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    async ({ postId, formData }) => {
      const response = await api.put(`/posts/${postId}`, formData, {
        headers: formData instanceof FormData ? {
          'Content-Type': 'multipart/form-data'
        } : {}
      });
      return response.data.data;
    },
    {
      onSuccess: (data) => {
        // Update the post in the cache
        queryClient.setQueryData(['posts', data.userId], (old) => {
          if (!old) return old;
          
          return {
            ...old,
            pages: old.pages.map(page => ({
              ...page,
              data: page.data.map(post => 
                post.id === data.id ? { ...post, ...data } : post
              )
            }))
          };
        });
      }
    }
  );
};

// Hook para eliminar una publicación
export const useDeletePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    async (postId) => {
      await api.delete(`/posts/${postId}`);
      return postId;
    },
    {
      onSuccess: (postId) => {
        // Remove the post from the cache
        queryClient.setQueryData('posts', (old) => {
          if (!old) return old;
          
          return {
            ...old,
            pages: old.pages.map(page => ({
              ...page,
              data: page.data.filter(post => post.id !== postId)
            }))
          };
        });
      }
    }
  );
};

// Hook para dar/quitar like a una publicación
export const useToggleLike = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    async (postId) => {
      const response = await api.post(`/posts/${postId}/like`);
      return { postId, data: response.data.data };
    },
    {
      onMutate: async (postId) => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries('posts');
        
        // Snapshot the previous value
        const previousPosts = queryClient.getQueryData('posts');
        
        // Optimistically update to the new value
        queryClient.setQueryData('posts', (old) => {
          if (!old) return old;
          
          return {
            ...old,
            pages: old.pages.map(page => ({
              ...page,
              data: page.data.map(post => {
                if (post.id === postId) {
                  const isLiked = post.likes?.some(like => like.userId === queryClient.getQueryData('user')?.id);
                  const likes = isLiked
                    ? post.likes.filter(like => like.userId !== queryClient.getQueryData('user')?.id)
                    : [...(post.likes || []), { userId: queryClient.getQueryData('user')?.id }];
                    
                  return {
                    ...post,
                    likes,
                    _count: {
                      ...post._count,
                      likes: isLiked ? post._count.likes - 1 : post._count.likes + 1
                    }
                  };
                }
                return post;
              })
            }))
          };
        });
        
        // Return a context object with the snapshotted value
        return { previousPosts };
      },
      
      // If the mutation fails, use the context returned from onMutate to roll back
      onError: (err, postId, context) => {
        if (context?.previousPosts) {
          queryClient.setQueryData('posts', context.previousPosts);
        }
      },
      
      // Always refetch after error or success
      onSettled: () => {
        queryClient.invalidateQueries('posts');
      }
    }
  );
};

// Hook para guardar/desguardar una publicación
export const useSavePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    async (postId) => {
      const response = await api.post(`/posts/${postId}/save`);
      return { postId, data: response.data.data };
    },
    {
      onSuccess: () => {
        // Invalidate and refetch
        queryClient.invalidateQueries('saved-posts');
      }
    }
  );
};

// Hook para obtener los comentarios de una publicación
export const useComments = (postId, options = {}) => {
  return useQuery(
    ['comments', postId],
    async () => {
      const response = await api.get(`/comments/post/${postId}`);
      return response.data;
    },
    {
      enabled: !!postId,
      ...options
    }
  );
};

// Hook para crear un comentario
export const useCreateComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    async ({ postId, content, parentId = null }) => {
      const response = await api.post('/comments', { postId, content, parentId });
      return response.data.data;
    },
    {
      onSuccess: (data, { postId }) => {
        // Update the comments count in the posts cache
        queryClient.setQueryData('posts', (old) => {
          if (!old) return old;
          
          return {
            ...old,
            pages: old.pages.map(page => ({
              ...page,
              data: page.data.map(post => {
                if (post.id === postId) {
                  return {
                    ...post,
                    _count: {
                      ...post._count,
                      comments: (post._count?.comments || 0) + 1
                    }
                  };
                }
                return post;
              })
            }))
          };
        });
        
        // Invalidate and refetch comments
        queryClient.invalidateQueries(['comments', postId]);
      }
    }
  );
};

// Hook para eliminar un comentario
export const useDeleteComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    async (commentId) => {
      await api.delete(`/comments/${commentId}`);
      return commentId;
    },
    {
      onSuccess: (commentId, { postId }) => {
        // Update the comments count in the posts cache
        queryClient.setQueryData('posts', (old) => {
          if (!old) return old;
          
          return {
            ...old,
            pages: old.pages.map(page => ({
              ...page,
              data: page.data.map(post => {
                if (post.id === postId) {
                  return {
                    ...post,
                    _count: {
                      ...post._count,
                      comments: Math.max(0, (post._count?.comments || 1) - 1)
                    }
                  };
                }
                return post;
              })
            }))
          };
        });
        
        // Invalidate and refetch comments
        queryClient.invalidateQueries(['comments', postId]);
      }
    }
  );
};

// Hook para dar/quitar like a un comentario
export const useToggleCommentLike = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    async (commentId) => {
      const response = await api.post(`/comments/${commentId}/like`);
      return { commentId, data: response.data.data };
    },
    {
      onSuccess: ({ commentId, data }, variables, context) => {
        // Update the comment in the cache
        queryClient.setQueryData(['comments', data.postId], (old) => {
          if (!old) return old;
          
          const updateCommentLikes = (comments) => {
            return comments.map(comment => {
              if (comment.id === commentId) {
                return {
                  ...comment,
                  isLiked: data.liked,
                  _count: {
                    ...comment._count,
                    likes: data.liked 
                      ? (comment._count?.likes || 0) + 1 
                      : Math.max(0, (comment._count?.likes || 1) - 1)
                  }
                };
              }
              
              // Check replies
              if (comment.replies?.length > 0) {
                return {
                  ...comment,
                  replies: updateCommentLikes(comment.replies)
                };
              }
              
              return comment;
            });
          };
          
          return {
            ...old,
            data: updateCommentLikes(old.data)
          };
        });
      }
    }
  );
};
