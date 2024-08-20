import clientApi from "@/lib/clientApi";
import { toQueryString } from "@/lib/validator";
import { getSession } from "next-auth/react";

export const getSessions = async (body) => {
  const query = toQueryString(body);
  const { data } = await clientApi.get(
    `/api/manage/session/getSessions${query}`
  );
  return data;
};

export const getSessionById = async (id: any) => {
  const { data } = await clientApi.get(
    `/api/manage/session/getSessionById/${id}`
  );
  return data;
};

export const filterTestLists = async (params: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(
    `/api/manage/session/filterTestLists${query}`
  );
  return data;
};

export const create = async (body: any) => {
  const { data } = await clientApi.post(`/api/manage/session/`, body);
  return data;
};

export const update = async (sessionId: any, session?: any) => {
  const { data } = await clientApi.put(
    `/api/manage/session/${sessionId}`,
    session
  );
  return data;
};

export const testStatus = async (p: any, params: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(
    `/api/manage/session/testStatus/${p}${query}`
  );
  return data;
};

export const getPracticesBySession = async (id: any) => {
  const { data } = await clientApi.get(
    `/api/manage/session/getPracticesBySession/${id}`
  );
  return data;
};

export const getSessionDetails = async (id: any) => {
  const { data } = await clientApi.get(
    `/api/manage/session/getSessionDetails/${id}`
  );
  return data;
};

export const updateStudentStatus = async (p: any, b: any) => {
  const { data } = await clientApi.put(
    `/api/manage/session/updateStudentStatus/${p}`,
    b
  );
  return data;
};

export const getStudentsByPractice = async (id: any, body: any) => {
  const query = toQueryString(body);
  const session = await getSession();
  const { data } = await clientApi.get(
    `https://newapi.practiz.xyz/api/v1/manage/session/getStudentsByPractice/${id}${query}`,
    {
      headers: {
        instancekey: session?.instanceKey,
        Authorization: `bearer ${session?.accessToken}`,
      },
    }
  );
  return data;
};
