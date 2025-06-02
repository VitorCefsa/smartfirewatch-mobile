import axios from 'axios';
import { API_URL } from '@env';

const api = axios.create({
  baseURL: API_URL,
});

export const getIncidents = async () => {
  const response = await api.get('/logs');
  return response.data;
};

// ✅ Adiciona esta função para resolver incidentes
export const resolveIncident = async (id) => {
  const response = await api.put(`/logs/${id}/resolver`);
  return response.data;
};
