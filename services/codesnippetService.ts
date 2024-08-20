import clientApi from "@/lib/clientApi";
import { toQueryString } from "@/lib/validator";
import { getSession } from "next-auth/react";

export const findFunc = async (params: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(`/api/codesnippet${query}`);
  return data;
};

export const getByUId = async (uid: any) => {
  const session = await getSession();

  const { data } = await clientApi.get(
    `https://newapi.practiz.xyz/api/v1/codesnippet/${uid}`,
    {
      headers: {
        instancekey: session?.instanceKey,
        Authorization: `bearer ${session?.accessToken}`,
      },
    }
  );
  return data;
};

export const createFunc = async (da: any) => {
  const { data } = await clientApi.post(`/api/codesnippet`, da);
  return data;
};

export const updateFunc = async (id: string, code: any) => {
  const { data } = await clientApi.put(`/api/codesnippet/${id}`, { code });
  return data;
};

export const changePairCoding = async (
  id: string,
  pairCoding: any,
  canPairEdit: any
) => {
  const { data } = await clientApi.put(`/api/codesnippet/${id}/pairCoding`, {
    pairCoding,
    canPairEdit,
  });
  return data;
};

export const deleteFunc = async (id: string) => {
  const session = await getSession();

  const { data } = await clientApi.delete(
    `https://newapi.practiz.xyz/api/v1/codesnippet/${id}`,
    {
      headers: {
        instancekey: session?.instanceKey,
        Authorization: `bearer ${session?.accessToken}`,
      },
    }
  );
  return data;
};
