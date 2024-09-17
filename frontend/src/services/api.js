import axiosInstance from '../services/axiosInstance'; 

export const fetchPets = () => axiosInstance.get('/api/pets/');
export const createPet = (pet) => axiosInstance.post('/api/pets/', pet);
export const updatePet = (id, updatedPet) => axiosInstance.patch(`/api/pets/${id}/`, updatedPet);
export const deletePet = (id) => axiosInstance.delete(`/pets/${id}/`);

export const registerUser = (userData) => axiosInstance.post('/api/register/', userData);
export const loginUser = (credentials) => axiosInstance.post('/api/token/', credentials);
export const refreshToken = (refresh) => axiosInstance.post('/api/token/refresh/', { refresh });
