import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

const AuthService = {
  register: async (data) => {
    return axios.post(`${API_BASE_URL}/api/auth/register`, data, { withCredentials: true });
  },
  login: async (data) => {
    return axios.post(`${API_BASE_URL}/api/auth/login`, data, { withCredentials: true });
  },
  logout: async () => {
    return axios.post(`${API_BASE_URL}/api/auth/logout`, {}, { withCredentials: true });
  },
  getMe: async () => {
  return axios.get(`${API_BASE_URL}/api/auth/me`, { withCredentials: true });
}

};



export default AuthService;
