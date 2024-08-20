import clientApi from "@/lib/clientApi";
import { toQueryString } from "@/lib/validator";
import { getSession } from "next-auth/react";

export const follow = async (params: any) => {
  const { data } = await clientApi.put(`/api/userFollow/follow`, params);
  return data;
};

export const amIFollow = async (id: any) => {
  const { data } = await clientApi.get(`/api/userFollow/amIFollow/${id}`);
  return data;
};

export const followList = async (params: any) => {
  const { data } = await clientApi.get(`/api/userFollow/followList/${params}`);
  return data;
};
