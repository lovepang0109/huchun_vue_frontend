import clientApi from "@/lib/clientApi";
import { toQueryString } from "@/lib/validator";
import { getSession } from "next-auth/react";

export const get = async () => {
  const { data } = await clientApi.get(`/api/users/me`);
  return data;
};

export const getUser = async (id: any, params?: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(`/api/users/${id}${query}`);
  return data;
};

export const getLinkPreview = async (params: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(
    `/api/users/link-preview/${params._id}${query}`
  );
  return data;
};

export const getEvents = async (params: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(`/api/users/events${query}`);
  return data;
};

export const addEvents = async (body: any) => {
  const { data } = await clientApi.post(`/api/users/addEvents`, body);
  return data;
};

export const updateEvent = async (id, params) => {
  const { data } = await clientApi.put(`/api/users/updateEvent/${id}`, params);
  return data;
};

export const deleteEvent = async (id: any) => {
  const { data } = await clientApi.delete(`/api/users/deleteEvent/${id}`);
  return data;
};

export const userRecentActivity = async (id: any) => {
  const { data } = await clientApi.get(`/api/users/userRecentActivity/${id}`);
  return data;
};

export const awardEducoins = async (body: any) => {
  const { data } = await clientApi.post(`/api/users/awardEducoins`, body);
  return data;
};

export const deductEducoins = async (body: any) => {
  const { data } = await clientApi.post(`/api/users/deductEducoins`, body);
  return data;
};

export const getUserSuperCoinActivities = async (id: any, q: any) => {
  const session = await getSession();

  const query = toQueryString(q);
  const { data } = await clientApi.get(
    `https://newapi.practiz.xyz/api/v1/users/getUserSuperCoinActivities/${id}${query}`,
    {
      headers: {
        instancekey: session?.instanceKey,
        Authorization: `bearer ${session?.accessToken}`,
      },
    }
  );
  return data;
};

export const updateUtmStatus = async (utm: any) => {
  const { data } = await clientApi.put(`/api/users/marketingUtm/status`, {
    utm,
  });
  return data;
};

export const updateSubjects = async (da: any) => {
  const { data } = await clientApi.put(`/api/users/updateSubjects`, da);
  return data;
};

export const updateCountry = async (da: any) => {
  const { data } = await clientApi.put(`/api/users/updateCountry`, da);
  return data;
};

export const addSubjects = async (subjects: any) => {
  const { data } = await clientApi.put(`/api/users/addSubjects`, { subjects });
  return data;
};

export const updateTimeAccommodation = async (da: any) => {
  const { data } = await clientApi.put(`/api/users/timeAccommodation`, { da });
  return data;
};

export const getTimeAccommodation = async (userId: any) => {
  const { data } = await clientApi.get(
    `/api/users/timeAccommodation/${userId}`
  );
  return data;
};
export const update = async (user: any) => {
  const { data } = await clientApi.put(`/api/users/${user._id}`, user);
  return data;
};

export const updateMentorPrefernces = async (id: any, body: any) => {
  const { data } = await clientApi.put(
    `/api/users/updateMentorPrefernces/${id}`,
    body
  );
  return data;
};


