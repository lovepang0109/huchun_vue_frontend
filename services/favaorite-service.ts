import clientApi from "@/lib/clientApi";
import { toQueryString } from "@/lib/validator";

export const create = async (favorite: any) => {
  try {
    const data = await clientApi.post(`/api/favorites/create`, favorite);
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const deleteFav = async (practiceId: any) => {
  try {
    const data = await clientApi.delete(`/api/favorites/delete/${practiceId}`);
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const findTestSeries = async (params: any) => {
  try {
    const query = toQueryString(params);

    const { data } = await clientApi.get(`/api/favorites/testseries${query}`);
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const findCourses = async (params: any) => {
  try {
    const query = toQueryString(params);

    const { data } = await clientApi.get(`/api/favorites/courses${query}`);
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const findPractices = async (params: any) => {
  try {
    const query = toQueryString(params);

    const { data } = await clientApi.get(`/api/favorites/practices${query}`);
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};
