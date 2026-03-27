import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');

// Admin
export const getAdminNgos = () => API.get('/admin/ngos');
export const getAdminStats = () => API.get('/admin/stats');
export const verifyNgo = (id) => API.put(`/admin/ngos/${id}/verify`);
export const restrictNgo = (id) => API.put(`/admin/ngos/${id}/restrict`);

// Listings
export const getListings = (params) => API.get('/listings', { params });
export const getMyListings = () => API.get('/listings/mine');
export const createListing = (data) => API.post('/listings', data);
export const updateListing = (id, data) => API.put(`/listings/${id}`, data);
export const deleteListing = (id) => API.delete(`/listings/${id}`);

// Requests
export const createRequest = (data) => API.post('/requests', data);
export const getIncomingRequests = () => API.get('/requests/incoming');
export const getMyRequests = () => API.get('/requests/mine');
export const acceptRequest = (id) => API.put(`/requests/${id}/accept`);
export const rejectRequest = (id) => API.put(`/requests/${id}/reject`);

// NGOs (public)
export const getVerifiedNgos = (params) => API.get('/ngos', { params });
export const getNgo = (id) => API.get(`/ngos/${id}`);

// Donations
export const createDonation = (data) => API.post('/donations', data);
export const getMyDonations = () => API.get('/donations/mine');
export const getReceivedDonations = () => API.get('/donations/received');

export default API;
