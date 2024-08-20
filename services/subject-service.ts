import clientApi from "@/lib/clientApi";
import { toQueryString } from "@/lib/validator";

export const getMine = async (params?: any) => {
  try {
    const query = toQueryString(params);

    const data = await clientApi.get(`/api/subjects/mine${query}`);

    return data.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const getTopicsByUnits = async (ids: any) => {
  try {
    const query = toQueryString(ids);

    const data = await clientApi.get(`/api/subjects/getTopicsByUnits${query}`);
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const getTeachersBySubjects = async (params?: any) => {
  try {
    const query = toQueryString(params);

    const data = await clientApi.get(
      `/api/subjects/getTeacherBySubjects${query}`
    );

    return data.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const getTeachersByPrograms = async (params?: any) => {
  try {
    const query = toQueryString(params);

    const data = await clientApi.get(
      `/api/programs/getTeachersByPrograms${query}`
    );

    return data.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const getUnitsBySubject = async (ids: any) => {
  try {
    const query = toQueryString(ids);

    const data = await clientApi.get(`/api/subjects/getUnitsBySubject${query}`);
    return data.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const getByTest = async (testId: any, params?: any) => {
  try {
    const query = toQueryString(params);

    const data = await clientApi.get(`/api/subjects/getByTest/${testId}${query}`);
    return data.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}