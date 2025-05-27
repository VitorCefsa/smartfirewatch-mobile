import axios from 'axios';
import { API_URL } from '@env';

const api = axios.create({
  baseURL: API_URL,
});

export const getIncidents = async () => {
  const response = await api.get('/logs'); 
  return response.data;
};
