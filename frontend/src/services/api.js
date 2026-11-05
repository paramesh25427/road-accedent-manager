import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getHealth = async () => {
  const res = await api.get('/health');
  return res.data;
};

export const predictRisk = async (payload) => {
  const res = await api.post('/predict', payload);
  return res.data;
};

export const getPredictions = async (limit = 100, skip = 0) => {
  const res = await api.get('/predictions', { params: { limit, skip } });
  return res.data;
};

export const clearPredictions = async () => {
  const res = await api.delete('/predictions');
  return res.data;
};

export const getAccidents = async (filters = {}) => {
  const res = await api.get('/accidents', { params: filters });
  return res.data;
};

export const getStatistics = async () => {
  const res = await api.get('/statistics');
  return res.data;
};

export const getRiskZones = async () => {
  const res = await api.get('/risk-zones');
  return res.data;
};

export const getModelPerformance = async () => {
  const res = await api.get('/model-performance');
  return res.data;
};

export const getFeatureImportance = async () => {
  const res = await api.get('/feature-importance');
  return res.data;
};

export const triggerTraining = async () => {
  const res = await api.post('/train');
  return res.data;
};

export default api;
