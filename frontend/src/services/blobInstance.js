// src/services/blobInstance.js
import axios from 'axios';

// Create an instance of Axios
const blobInstance = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8001', // Set your API base URL
    responseType: 'blob',
});

// Add a request interceptor to include the Authorization header
blobInstance.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem('access_token');
        if (accessToken) {
            config.headers['Authorization'] = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default blobInstance;

