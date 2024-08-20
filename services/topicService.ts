import clientApi from "@/lib/clientApi";
import { toQueryString } from "@/lib/validator";
import { getSession } from "next-auth/react";

export const getByUnit = async (unitId, p?) => {
  const query = toQueryString(p);
  const { data } = await clientApi.get(`/api/topics/byUnit/${unitId}${query}`);
  return data;
};

export const getOneTopic = async (params: any) => {
  const { data } = await clientApi.get(`/api/topics/${params}`);
  return data;
};

export const addTopic = async (params: any) => {
  const { data } = await clientApi.post(`/api/topics/`, params);
  return data;
};

export const editTopic = async (params: any) => {
  const { data } = await clientApi.put(`/api/topics/${params._id}`, params);
  return data;
};

export const updateStatus = async (params: any) => {
  const { data } = await clientApi.put(
    `/api/topics/updateStatus/${params._id}`,
    params
  );
  return data;
};
