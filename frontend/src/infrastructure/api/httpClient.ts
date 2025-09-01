import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

export class HttpClient {
  private instance: AxiosInstance;
  private static instance: HttpClient;
  private authToken: string | null = null;
  private baseURL: string;
  private readonly AUTH_TOKEN_KEY = 'auth_token';

  private constructor(baseURL: string) {
    this.baseURL = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
    this.instance = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
      timeout: 10000, // 10 seconds timeout
    });

    // Load token from storage if available
    this.authToken = localStorage.getItem(this.AUTH_TOKEN_KEY);
    if (this.authToken) {
      this.setToken(this.authToken);
    }

    this.initializeRequestInterceptor();
    this.initializeResponseInterceptor();
  }

  public static getInstance(baseURL?: string): HttpClient {
    if (!HttpClient.instance && baseURL) {
      HttpClient.instance = new HttpClient(baseURL);
    }
    return HttpClient.instance;
  }

  public setToken(token: string | null) {
    this.authToken = token;
    if (token) {
      localStorage.setItem(this.AUTH_TOKEN_KEY, token);
      this.instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem(this.AUTH_TOKEN_KEY);
      delete this.instance.defaults.headers.common['Authorization'];
    }
  }

  public clearToken() {
    this.setToken(null);
    // Also clear any user data
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }

  private initializeRequestInterceptor() {
    this.instance.interceptors.request.use(
      (config) => {
        const token = this.authToken || localStorage.getItem(this.AUTH_TOKEN_KEY);
        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  private initializeResponseInterceptor() {
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        // Store token if it comes in the response
        if (response.data?.token) {
          this.setToken(response.data.token);
        }
        return response;
      },
      async (error: AxiosError) => {
        // Handle 401 Unauthorized responses (expired or invalid tokens)
        if (error.response?.status === 401) {
          console.log('[HttpClient] Token expirado o inválido, limpiando autenticación');
          
          // Clear all authentication data
          this.clearToken();
          
          // Only redirect if not already on login page
          if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
            console.log('[HttpClient] Redirigiendo a login');
            window.location.href = '/login';
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // HTTP methods
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.get<T>(url, config);
  }

  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.post<T>(url, data, config);
  }

  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.put<T>(url, data, config);
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.delete<T>(url, config);
  }

  public async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.patch<T>(url, data, config);
  }
}

// Initialize with the base API URL
export const httpClient = HttpClient.getInstance(import.meta.env.VITE_API_URL || 'http://localhost:5000/api');
