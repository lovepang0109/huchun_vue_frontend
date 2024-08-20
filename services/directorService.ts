import clientApi from "@/lib/clientApi";
import { toQueryString } from "@/lib/validator";
import { getSession } from "next-auth/react";

export const getDashboardSummary = async (id, params: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(`/api/director/summary/${id}${query}`);
  return data;
};

export const getLoginTrend = async (params: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(`/api/director/loginTrend${query}`);
  return data;
};

export const getPostTrend = async (params: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(`/api/director/postTrend${query}`);
  return data;
};

export const getMostAttemptedStudent = async (params: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(
    `/api/director/mostAttemptedStudent${query}`
  );
  return data;
};

export const getAvgTimeSpendByCourse = async (id, params: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(
    `/api/director/avgTimeSpentByCourse/${id}${query}`
  );
  return data;
};

export const getQuestionAddedTrend = async (id, params: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(
    `/api/director/questionAddedTrend/${id}${query}`
  );
  return data;
};

export const getAttemptTrend = async (params: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(`/api/director/attemptTrend${query}`);
  return data;
};

export const getAbandondAttemptTrend = async (params: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(`/api/director/abandonedTrend${query}`);
  return data;
};

export const getStudentOnboardingDistribution = async (params: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(
    `/api/director/studentOnboardingDistribution${query}`
  );
  return data;
};

export const getTestseriesUltilization = async (params: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(
    `/api/director/testseriesUltilization${query}`
  );
  return data;
};

export const getCourseUltilization = async (params: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(
    `/api/director/courseUltilization${query}`
  );
  return data;
};
