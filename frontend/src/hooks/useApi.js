import { useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';
import { isAuthenticated } from '../utils/auth';

/**
 * Custom hook for making API calls with loading, error, and success states
 * @param {Function} apiCall - The API call function to execute
 * @param {*} initialData - Initial data to set before the first API call
 * @param {Boolean} immediate - Whether to execute the API call immediately
 * @returns {Object} - { data, loading, error, status, execute, setData }
 */
export function useApi(apiCall, initialData = null, immediate = true) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useContext(AuthContext);

  const execute = useCallback(
    async (...args) => {
      // Skip if we're not authenticated (except for auth endpoints)
      const isAuthEndpoint = apiCall.toString().includes('/auth/');
      if (!isAuthEndpoint && !isAuthenticated()) {
        console.warn('[useApi] No autenticado, redirigiendo a login...');
        navigate('/login', { 
          state: { from: location.pathname },
          replace: true
        });
        return;
      }

      setLoading(true);
      setStatus('loading');
      setError(null);
      
      try {
        const response = await apiCall(...args);
        setData(response);
        setStatus('success');
        return response;
      } catch (err) {
        console.error('[useApi] Error en la petición:', err);
        setError(err);
        setStatus('error');
        
        // Only handle errors that haven't been handled by the interceptor
        if (err.status === 403) {
          navigate('/unauthorized', { replace: true });
        }
        
        // Re-throw the error so the calling component can handle it if needed
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiCall, navigate, location.pathname, logout]
  );

  useEffect(() => {
    if (immediate) {
      execute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    data,
    loading,
    error,
    status,
    execute,
    setData, // Permite actualizar los datos manualmente
  };
}

export function usePaginatedApi(apiCall, initialData = [], initialPage = 1, pageSize = 10) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('idle');

  const loadData = useCallback(
    async (newPage = page, append = false) => {
      setLoading(true);
      setStatus('loading');
      
      try {
        const response = await apiCall(newPage, pageSize);
        
        setData(prevData => 
          append ? [...prevData, ...response.items] : response.items
        );
        
        setTotal(response.total || 0);
        setHasMore(response.hasMore !== undefined ? response.hasMore : response.items.length === pageSize);
        setError(null);
        setStatus('success');
        setPage(newPage);
        
        return response;
      } catch (err) {
        setError(err);
        setStatus('error');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiCall, page, pageSize]
  );

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      return loadData(page + 1, true);
    }
    return Promise.resolve();
  }, [hasMore, loadData, loading, page]);

  const refresh = useCallback(() => {
    return loadData(1, false);
  }, [loadData]);

  useEffect(() => {
    loadData(1, false);
  }, []);

  return {
    data,
    loading,
    error,
    status,
    page,
    hasMore,
    total,
    loadMore,
    refresh,
    setData,
  };
}

export function useInfiniteScroll(loadMore, hasMore, loading, threshold = 200) {
  useEffect(() => {
    if (!hasMore || loading) return;

    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop + threshold >=
        document.documentElement.offsetHeight
      ) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore, hasMore, loading, threshold]);
}
