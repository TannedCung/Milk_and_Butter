import axiosInstance from '../services/axiosInstance'; 
import blobInstance from '../services/blobInstance'; 

export const fetchPets = () => axiosInstance.get('/api/pets/');
export const fetchPetById = (id) => axiosInstance.get(`/api/pets/${id}/`); // Added this line
export const fetchPetAvatar = (id) => blobInstance.get(`/api/pets/${id}/avatar/`);
export const createPet = (pet) => axiosInstance.post('/api/pets/', pet);
export const updatePet = (id, updatedPet) => axiosInstance.patch(`/api/pets/${id}/`, updatedPet);
export const deletePet = (id) => axiosInstance.delete(`/api/pets/${id}/`); // Fixed the URL to match the others

export const registerUser = (userData) => axiosInstance.post('/api/register/', userData);
export const loginUser = (credentials) => axiosInstance.post('/api/token/', credentials);
export const refreshToken = (refresh) => axiosInstance.post('/api/token/refresh/', { refresh });
