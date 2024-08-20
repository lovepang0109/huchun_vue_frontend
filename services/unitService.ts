import clientApi from "@/lib/clientApi";
import { toQueryString } from "@/lib/validator";
import { getSession } from "next-auth/react";

export const getBySubject = async (subjectId, p?) => {
  const query = toQueryString(p);
  const { data } = await clientApi.get(
    `/api/units/bySubject/${subjectId}${query}`
  );
  return data;
};

export const getOneUnit = async (params) => {
  const session = await getSession();
  const { data } = await clientApi.get(
    `https://newapi.practiz.xyz/api/v1/units/${params}`,
    {
      headers: {
        instancekey: session?.instanceKey,
        Authorization: `bearer ${session?.accessToken}`,
      },
    }
  );
  return data;
};

export const addUnit = async (params) => {
  const { data } = await clientApi.post(`/api/units`, params);
  return data;
};

export const editUnit = async (params) => {
  const { data } = await clientApi.put(`/api/units/${params._id}`, params);
  return data;
};

export const updateStatus = async (params) => {
  const { data } = await clientApi.put(
    `/api/units/updateStatus/${params.id}`,
    params
  );
  return data;
};
