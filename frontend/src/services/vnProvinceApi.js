import axios from 'axios';

const BASE_URL = 'https://provinces.open-api.vn/api';

export const getProvinces = async () => {
  const response = await axios.get(`${BASE_URL}/p/`);
  return response.data;
};

export const getDistricts = async (provinceCode) => {
  const response = await axios.get(`${BASE_URL}/p/${provinceCode}?depth=2`);
  return response.data.districts;
};

export const getWards = async (districtCode) => {
  const response = await axios.get(`${BASE_URL}/d/${districtCode}?depth=2`);
  return response.data.wards;
};
