import axiosInstance from '../services/axiosInstance'; 
import blobInstance from '../services/blobInstance'; 

// Pet API functions
export const fetchPets = (page = 1, pageSize = 10) => axiosInstance.get(`/api/pets/?page=${page}&page_size=${pageSize}`);
export const fetchPetById = (id) => axiosInstance.get(`/api/pets/${id}/`);
export const fetchPetAvatar = (id) => blobInstance.get(`/api/pets/${id}/avatar/`);
export const createPet = (pet) => axiosInstance.post('/api/pets/', pet);
export const updatePet = (id, updatedPet) => axiosInstance.patch(`/api/pets/${id}/`, updatedPet);
export const deletePet = (id) => axiosInstance.delete(`/api/pets/${id}/`);

// Health Status API functions
export const fetchHealthStatus = (petId, page = 1, pageSize = 10) => 
    axiosInstance.get(`/api/health-status/?pet=${petId}&page=${page}&page_size=${pageSize}`);
export const createHealthStatus = (healthData) => axiosInstance.post('/api/health-status/', healthData);
export const updateHealthStatus = (id, healthData) => axiosInstance.patch(`/api/health-status/${id}/`, healthData);
export const deleteHealthStatus = (id) => axiosInstance.delete(`/api/health-status/${id}/`);

// Vaccination API functions
export const fetchVaccinations = (petId, page = 1, pageSize = 10) => 
    axiosInstance.get(`/api/vaccination/?pet=${petId}&page=${page}&page_size=${pageSize}`);
export const createVaccination = (vaccinationData) => axiosInstance.post('/api/vaccination/', vaccinationData);
export const updateVaccination = (id, vaccinationData) => axiosInstance.patch(`/api/vaccination/${id}/`, vaccinationData);
export const deleteVaccination = (id) => axiosInstance.delete(`/api/vaccination/${id}/`);

// Auth API functions
export const registerUser = (userData) => axiosInstance.post('/api/register/', userData);
export const loginUser = (credentials) => axiosInstance.post('/api/token/', credentials);
export const refreshToken = (refresh) => axiosInstance.post('/api/token/refresh/', { refresh });
