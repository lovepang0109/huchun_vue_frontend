import clientApi from "@/lib/clientApi";
import { toQueryString } from "@/lib/validator";
import { getSession } from "next-auth/react";

export const findAll = async (params?: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(`/api/programs${query}`);
  return data;
};

export const getMineProgram = async (params?: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(`/api/programs/mine${query}`);
  return data;
};

export const addProgram = async (params: any) => {
  const session = await getSession();

  const { data } = await clientApi.post(
    "https://newapi.practiz.xyz/api/v1/programs/",
    params,
    {
      headers: {
        instancekey: session?.instanceKey,
        Authorization: `bearer ${session?.accessToken}`,
      },
    }
  );
  return data;
};

export const editProgram = async (params: any) => {
  const session = await getSession();

  const { data } = await clientApi.put(
    "https://newapi.practiz.xyz/api/v1/programs/" + params._id,
    params,
    {
      headers: {
        instancekey: session?.instanceKey,
        Authorization: `bearer ${session?.accessToken}`,
      },
    }
  );
  return data;
};

export const updateStatus = async (params: any) => {
  const { data } = await clientApi.put(
    "/api/programs/updateStatus/" + params._id,
    params
  );
  return data;
};

export const getOneProgam = async (params: any) => {
  const { data } = await clientApi.get("/api/programs/" + params);
  return data;
};

export const getPublisherPrograms = async (params?: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get("/api/programs/publisher" + query);
  return data;
};

export const getTeachersByPrograms = async (params?: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(
    "/api/programs/getTeachersByPrograms" + query
  );
  return data;
};

export const getMine = async (params?: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get("/api/programs/mine" + query);
  return data;
};
