import clientApi from "@/lib/clientApi";
import { toQueryString } from "@/lib/validator";
import { getSession } from "next-auth/react";

export const update = async (id: any, params: any) => {
  const { data } = await clientApi.put(`/api/supercoins/${id}`, params);
  return data;
};

export const create = async (params: any) => {
  const { data } = await clientApi.post(`/api/supercoins`, params);
  return data;
};

export const getLists = async (params: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(`/api/supercoins${query}`);
  return data;
};

export const getMembers = async (params: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(`/api/supercoins/members${query}`);
  return data;
};

export const requestStudents = async (params: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(`/api/supercoins/requests${query}`);
  return data;
};

export const updateStatus = async (id: any, params: any) => {
  const { data } = await clientApi.put(
    `/api/supercoins/updateStatus/${id}`,
    params
  );
  return data;
};
