import clientApi from "@/lib/clientApi";
import { toQueryString } from "@/lib/validator";
import { getSession } from "next-auth/react";

export const getMyInstitutes = async (params?: any) => {
  const { data } = await clientApi.get(
    `/api/institute/mine${toQueryString(params)}`
  );
  return data;
};

export const checkInstituteAvailability = async (code: any) => {
  const session = await getSession();
  const { data } = await clientApi.get(
    `https://newapi.practiz.xyz/api/v1/institute/checkAvailability/${code}`,
    {
      headers: {
        instancekey: session?.instanceKey,
        Authorization: `bearer ${session?.accessToken}`,
      },
    }
  );
  return data;
};

export const createInstitute = async (params: any) => {
  const session = await getSession();

  const { data } = await clientApi.post(
    `https://newapi.practiz.xyz/api/v1/institute`,
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

export const updadteInstitute = async (id, params) => {
  const { data } = await clientApi.put(`/api/institute/${id}`, params);
  return data;
};

export const addBannerImage = async (locId, type, title, url) => {
  const { data } = await clientApi.put(
    `/api/institute/addBannerImage/${locId}`,
    { type, title, url }
  );
  return data;
};

export const deleteBannerImage = async (locId, bannerId) => {
  const { data } = await clientApi.put(
    `/api/institute/deleteBannerImage/${locId}`,
    { bannerId }
  );
  return data;
};

export const getProfilePrograms = async (id, params?) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(
    `/api/institute/${id}/profilePrograms${query}`
  );
  return data;
};

export const getInstitute = async (id, params?) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(`/api/institute/${id}${query}`);
  return data;
};

export const updateInstitutePrefernces = async (id, body) => {
  const { data } = await clientApi.put(
    `/api/institute/updateInstitutePrefernces/${id}`,
    body
  );
  return data;
};

export const getInstitutePublicProfile = async (id, params?) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(
    `/api/institute/publicProfile/${id}${query}`
  );
  return data;
};

export const getInstituteInvitees = async (id) => {
  const { data } = await clientApi.get(
    `/api/institute/getInstituteInvitees/${id}`
  );
  return data;
};

export const getPrograms = async (params?: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(`/api/programs/institute${query}`);
  return data;
};

export const getSubjects = async (params?: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(`/api/subjects/institute${query}`);
  return data;
};

export const setDefaultInstitute = async () => {
  const { data } = await clientApi.post(`/api/institute/setDefault`, {});
  return data;
};

export const joinInstitute = async (code?: any) => {
  const { data } = await clientApi.post(`/api/institute/join`, { code });
  return data;
};

export const changeActiveInstitute = async (instituteId: any) => {
  const { data } = await clientApi.put(`/api/institute/changeActiveInstitute`, {
    instituteId,
  });
  return data;
};
