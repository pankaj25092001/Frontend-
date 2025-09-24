import axios from 'axios';

// 1. Create a new instance of Axios with our backend's base URL
const api = axios.create({
    baseURL: 'http://localhost:8000/api/v1',
    // 2. This is CRUCIAL for sending cookies
    withCredentials: true 
});

// 3. This is our upgraded "smart assistant"
api.interceptors.response.use(
    // If the response is successful, just pass it through.
    (response) => response,

    // If the response is an error, this special function runs.
    async (error) => {
        const originalRequest = error.config;
        
        // --- THE FINAL FIX IS HERE ---
        // 4. THE NEW, SMARTER CHECK:
        // We check three things:
        // a) Is the error a 401 (Unauthorized)?
        // b) Have we already tried to refresh once? (prevents loops on other requests)
        // c) Was the request that FAILED the refresh-token endpoint itself? (prevents the infinite loop)
        if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/users/refresh-token') {
            
            originalRequest._retry = true; // Mark this request so we don't try again

            try {
                // 5. The assistant runs to the security office to get a new keycard
                console.log("Access token expired. Attempting to refresh...");
                await api.post('/users/refresh-token');
                console.log("Tokens refreshed successfully. Retrying original request.");
                
                // 6. The assistant retries the original request that failed
                return api(originalRequest);
            } catch (refreshError) {
                // If the refresh token itself is invalid, then we give up.
                console.error("Refresh token is invalid. User must log in again.");
                // In a real app, we would clear all user state and redirect to /login here.
                return Promise.reject(refreshError);
            }
        }
        
        // For any other error, just pass it along.
        return Promise.reject(error);
    }
);

export default api;
