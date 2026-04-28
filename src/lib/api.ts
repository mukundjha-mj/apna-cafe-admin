import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});
  
export const getOrders = async (cafeId: string) => {
  const response = await api.get(`/orders/cafe/${cafeId}`);
  return response.data.data;
};

export const updateOrderStatus = async (orderId: string, status: string) => {
  const response = await api.patch(`/orders/${orderId}/status`, { status });
  return response.data;
};

export const getCafes = async () => {
  const response = await api.get(`/cafe?t=${Date.now()}`);
  return response.data.data;
};

export const getMenuItems = async (cafeId: string) => {
  const response = await api.get(`/menu?cafeId=${cafeId}&all=true`);
  return response.data.data;
};

export const getDashboardStats = async (cafeId: string) => {
  const response = await api.get(`/orders/analytics/${cafeId}`);
  return response.data.data;
};

export const getSalesChartData = async (cafeId: string) => {
  const response = await api.get(`/orders/sales-chart/${cafeId}`);
  return response.data.data;
};

export const toggleMenuItemAvailability = async (id: string, isAvailable: boolean) => {
  const response = await api.patch(`/menu/${id}`, { isAvailable });
  return response.data;
};

export const uploadMenuImage = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/menu/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.url;
};

export default api;
