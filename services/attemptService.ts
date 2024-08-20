import clientApi from "@/lib/clientApi";

import { toQueryString } from "@/lib/validator";

export const getPsychoClassroom = async (testId: string) => {
  try {
    const data = await clientApi.get(`/api/attempts/psychoClassroom/${testId}`);

    return data.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const getClassroomByTest = async (testId: string) => {
  try {
    const { data } = await clientApi.get(
      `/api/attempts/classroomByTest/${testId}`
    );

    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const summaryPsychoPractice = async (
  practiceSetId: string,
  params: any
) => {
  try {
    const query = toQueryString(params);
    const data = await clientApi.get(
      `/api/student/summaryPsychoPractice/${practiceSetId}${query}`
    );

    return data.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const summaryAttemptedPractice = async (
  practiceSetId: any,
  params: any
) => {
  try {
    const query = toQueryString(params);
    const data = await clientApi.get(
      `/api/student/summaryAttemptedPractice/${practiceSetId}${query}`
    );

    return data.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const updateAbandonStatus = async (id: number, params?: any) => {
  try {
    const query = toQueryString(params);
    const data = await clientApi.get(
      `/api/student/updateAbandonStatus/${id}`,
      params
    );

    return data.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const getClassroomAttempts = async (classroom: string, params: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(
    `/api/student/findClassroomAttempts/${classroom}${query}`
  );
  return data;
};

export const getAttemptsByTest = async (testId: string, params: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(
    `/api/attempts/byTest/${testId}${query}`
  );
  return data;
};

export const getRecentAttempts = async (params: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(`/api/attempts/recent${query}`);
  return data;
};

export const getNextAdaptiveSection = async (id: any, params: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(
    `/api/attempts/nextAdaptiveSection/${id}${query}`
  );
  return data;
};

export const accuracyBySubject = async (params: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(
    `/api/attempts/accuracyBySubject/${params.practicesetId}${query}`
  );
  return data;
};
