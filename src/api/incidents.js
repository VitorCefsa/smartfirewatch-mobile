// Importa a biblioteca axios para fazer requisições HTTP
import axios from 'axios';

// Importa a variável de ambiente que contém a URL base da API
import { API_URL } from '@env';

// Cria uma instância do axios com a URL base definida pela variável de ambiente
const api = axios.create({
  baseURL: API_URL,
});

// Função assíncrona que busca os incidentes (logs) da API
export const getIncidents = async () => {
  const response = await api.get('/logs'); // Faz uma requisição GET para /logs
  return response.data; // Retorna os dados da resposta
};

// Função assíncrona que resolve um incidente específico, identificado pelo ID
export const resolveIncident = async (id) => {
  const response = await api.put(`/logs/${id}/resolver`); // Envia uma requisição PUT para resolver o incidente
  return response.data; // Retorna os dados da resposta
};
