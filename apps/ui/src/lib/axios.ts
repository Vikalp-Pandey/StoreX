import axios from 'axios';

const baseURL = (import.meta as any).env.VITE_BASE_BACKEND_URL;

export const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true,
});
