import clientApi from "@/lib/clientApi";
import { toQueryString } from "@/lib/validator";

const API_BASE_URL = "/api/notifications";

export const findAll = async (params: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(`${API_BASE_URL}${query}`);
  return data;
};

export const setReadMsg = async (id: string) => {
  const { data } = await clientApi.post(
    `${API_BASE_URL}/setReadMsg/${id}`,
    null
  );
  return data;
};

export const removeByUser = async (id: string) => {
  const { data } = await clientApi.delete(`${API_BASE_URL}/removeByUser/${id}`);
  return data;
};

export const countUnread = async (params: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(`${API_BASE_URL}/countUnread${query}`);
  return data;
};

export const findOne = async (id: string) => {
  const { data } = await clientApi.get(`${API_BASE_URL}/findOne/${id}`);
  return data;
};

export const readAll = async (type: string) => {
  const { data } = await clientApi.put(`${API_BASE_URL}/readAll`, { type });
  return data;
};
