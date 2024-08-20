import clientApi from "@/lib/clientApi";
import { toQueryString } from "@/lib/validator";
import { getSession } from "next-auth/react";

export const getMine = async (params?: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(`/api/subjects/mine${query}`);
  return data;
};

export const getTeachersBySubjects = async (params?: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(
    `/api/subjects/getTeacherBySubjects${query}`
  );
  return data;
};

export const getSubjectTree = async (subjects: any) => {
  const query = toQueryString({ subjects });
  const { data } = await clientApi.get("/subjects/getSubjectTree" + query);
  return data;
};

export const findAll = async (params?: any) => {
  const query = toQueryString({ params });
  const { data } = await clientApi.get(`/api/subjects`);
  return data;
};

export const getPublisherSubject = async (params?: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(`/api/subjects/publisher${query}`);
  return data;
};

export const getSubjectList = async (params?: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(`/api/subjects/getSubjectList${query}`);
  return data;
};

export const getOneSubject = async (subjectId: any) => {
  const session = await getSession();

  const { data } = await clientApi.get(
    `https://newapi.practiz.xyz/api/v1/subjects/${subjectId}`,
    {
      headers: {
        instancekey: session?.instanceKey,
        Authorization: `bearer ${session?.accessToken}`,
      },
    }
  );
  return data;
};

export const addSubject = async (params: any) => {
  const { data } = await clientApi.post(`/api/subjects`, params);
  return data;
};

export const editSubject = async (subId: any, params: any) => {
  const session = await getSession();

  const { data } = await clientApi.put(
    `https://newapi.practiz.xyz/api/v1/subjects/${subId}`,
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
    `/api/subjects/updateStatus/${params.id}`,
    params
  );
  return data;
};

export const importFunc = async (da: any) => {
  const session = await getSession();

  const { data } = await clientApi.post(
    `https://newapi.practiz.xyz/api/v1/subjects/import`,
    da,
    {
      headers: {
        instancekey: session?.instanceKey,
        Authorization: `bearer ${session?.accessToken}`,
      },
    }
  );
  return data;
};

export const getAdaptiveSubjects = async () => {
  const { data } = await clientApi.get(`/api/subjects/adaptive`);
  return data;
};

export const getByTest = async (testId, params?) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(
    `/api/subjects/getByTest/${testId}${query}`
  );
  return data;
};
