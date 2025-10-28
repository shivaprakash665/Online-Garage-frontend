import axios from 'axios';

const API_BASE ='http://localhost:4500/api/vehicles';

export const getFuelTypes = async () => {
  const res = await axios.get(`${API_BASE}/fueltypes`);
  return res.data;
};

export const addVehicle = async (formData, token) => {
  // formData: FormData object (with image file)
  const headers = {
    'Content-Type': 'multipart/form-data'
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await axios.post(`${API_BASE}/add`, formData, { headers });
  return res.data;
};

export const getVehiclesByUser = async (userId) => {
  const res = await axios.get(`${API_BASE}/user/${userId}`);
  return res.data;
};
