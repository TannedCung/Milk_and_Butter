import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:1998/api' });

export const fetchPets = () => API.get('/pets/');
export const createPet = (pet) => API.post('/pets/', pet);
export const updatePet = (id, updatedPet) => API.patch(`/pets/${id}/`, updatedPet);
export const deletePet = (id) => API.delete(`/pets/${id}/`);

export const registerUser = (userData) => API.post('/register/', userData);
export const loginUser = (credentials) => API.post('/token/', credentials);
export const refreshToken = (refresh) => API.post('/token/refresh/', { refresh });
