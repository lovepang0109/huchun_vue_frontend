import clientApi from "@/lib/clientApi";
import { toQueryString } from "@/lib/validator";
import { getSession } from "next-auth/react";

export const getSoldData = async (q?: any) => {
  const query = toQueryString(q);
  const { data } = await clientApi.get(`/api/publishers/getSoldData${query}`);
  return data;
};

export const getAssessmetSubjectDistribution = async () => {
  const { data } = await clientApi.get(
    `/api/publishers/getAssessmetSubjectDistribution`
  );
  return data;
};

export const getCourseSubjectDistribution = async () => {
  const { data } = await clientApi.get(
    `/api/publishers/getCourseSubjectDistribution`
  );
  return data;
};

export const getTestseriesSubjectDistribution = async () => {
  const { data } = await clientApi.get(
    `/api/publishers/getTestseriesSubjectDistribution`
  );
  return data;
};

export const getQuestionSubjectDistribution = async () => {
  const { data } = await clientApi.get(
    `/api/publishers/getQuestionSubjectDistribution`
  );
  return data;
};

export const testseriesTrend = async (q: any) => {
  const query = toQueryString(q);
  const { data } = await clientApi.get(
    `/api/publishers/testseriesTrend${query}`
  );
  return data;
};

export const courseTrend = async (q: any) => {
  const query = toQueryString(q);
  const { data } = await clientApi.get(`/api/publishers/courseTrend${query}`);
  return data;
};

export const assessmentTrend = async (q: any) => {
  const query = toQueryString(q);
  const { data } = await clientApi.get(
    `/api/publishers/assessmentTrend${query}`
  );
  return data;
};

export const getTransactionLogs = async (q: any) => {
  const query = toQueryString(q);
  const { data } = await clientApi.get(
    `/api/publishers/getTransactionLogs${query}`
  );
  return data;
};
