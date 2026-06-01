// import axios from 'axios';

// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// const api = axios.create({
//   baseURL: API_URL,
//   // No default headers at all
// });

// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('access_token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
    
//     // Axios will automatically set the correct Content-Type:
//     // - For plain objects/JSON: application/json
//     // - For FormData: multipart/form-data with boundary
//     // - For strings: text/plain
//     // So we don't need to set it manually at all
    
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       localStorage.removeItem('access_token');
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );

// export default api;


// src/services/api.js
// import axios from 'axios';

// const API_BASE_URL = 'http://localhost:8000';

// const api = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Request interceptor to add auth token
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('access_token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Response interceptor for error handling
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       // Token expired or invalid
//       localStorage.removeItem('access_token');
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );

// export default api;

// Make sure your api client is set up correctly
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  // Don't set default Content-Type here
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // or however you store it
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;