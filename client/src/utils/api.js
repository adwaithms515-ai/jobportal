const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  
  // Set default headers
  const token = localStorage.getItem('accessToken');
  const headers = {
    ...options.headers
  };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Adjust content-type automatically if sending FormData
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const fetchOptions = {
    ...options,
    headers
  };

  try {
    const response = await fetch(url, fetchOptions);
    
    // Handle Token Expiry (401 Unauthorized)
    if (response.status === 401 && localStorage.getItem('refreshToken')) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            fetchOptions.headers['Authorization'] = `Bearer ${newToken}`;
            return fetch(url, fetchOptions).then(res => res.json());
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const refreshResponse = await fetch(`${API_URL}/auth/refresh-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ refreshToken: localStorage.getItem('refreshToken') })
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          localStorage.setItem('accessToken', refreshData.accessToken);
          localStorage.setItem('refreshToken', refreshData.refreshToken);
          
          processQueue(null, refreshData.accessToken);
          isRefreshing = false;

          // Retry original request
          fetchOptions.headers['Authorization'] = `Bearer ${refreshData.accessToken}`;
          const retryResponse = await fetch(url, fetchOptions);
          return await retryResponse.json();
        } else {
          // Refresh failed
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          processQueue(new Error('Refresh token expired'));
          isRefreshing = false;
        }
      } catch (refreshError) {
        processQueue(refreshError);
        isRefreshing = false;
        throw refreshError;
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'API request failed');
    }

    // Serve json parsed payload
    return await response.json();
  } catch (error) {
    console.error(`API Request Error [${endpoint}]:`, error.message);
    throw error;
  }
};

const api = {
  get: (endpoint, headers) => apiRequest(endpoint, { method: 'GET', headers }),
  post: (endpoint, body, headers) => apiRequest(endpoint, { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body), headers }),
  put: (endpoint, body, headers) => apiRequest(endpoint, { method: 'PUT', body: body instanceof FormData ? body : JSON.stringify(body), headers }),
  delete: (endpoint, headers) => apiRequest(endpoint, { method: 'DELETE', headers })
};

export default api;
