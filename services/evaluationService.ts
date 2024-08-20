import clientApi from "@/lib/clientApi";
import { toQueryString } from "@/lib/validator";
import { getSession } from "next-auth/react";

export const questionEvaluation = async (attemptId: any, params: any) => {
  const { data } = await clientApi.put(
    `/api/evaluation/question/${attemptId}`,
    params
  );
  return data;
};

export const getPendingTests = async (params: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(`/api/evaluation/pendingTests${query}`);
  return data;
};

export const startTestEvaluation = async (testId: string, params?: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(
    `/api/evaluation/startTestEvaluation/${testId}${query}`
  );
  return data;
};

export const getTestEvaluationStats = async (testId: string, params: any) => {
  const query = toQueryString(params);
  const session = await getSession();

  const { data } = await clientApi.get(
    `https://newapi.practiz.xyz/api/v1/evaluation/testEvaluationStats/${testId}${query}`,
    {
      headers: {
        instancekey: session?.instanceKey,
        Authorization: `bearer ${session?.accessToken}`,
      },
    }
  );
  return data;
};

export const getQuestionsForEvaluationByTest = async (
  testId: string,
  params: any
) => {
  const query = toQueryString(params);
  const session = await getSession();

  const { data } = await clientApi.get(
    `https://newapi.practiz.xyz/api/v1/evaluation/questionsByTest/${testId}${query}`,
    {
      headers: {
        instancekey: session?.instanceKey,
        Authorization: `bearer ${session?.accessToken}`,
      },
    }
  );
  return data;
};

export const getStudentsForEvaluationByTest = async (
  testId: string,
  params?: any
) => {
  const query = toQueryString(params);
  const session = await getSession();

  const { data } = await clientApi.get(
    `https://newapi.practiz.xyz/api/v1/evaluation/studentsByTest/${testId}${query}`,
    {
      headers: {
        instancekey: session?.instanceKey,
        Authorization: `bearer ${session?.accessToken}`,
      },
    }
  );
  return data;
};

export const getUnassignedTests = async (params?: any) => {
  const query = toQueryString(params);

  const { data } = await clientApi.get(
    `/api/evaluation/unassignedTests${query}`
  );
  return data;
};

export const getAssignedTests = async (params?: any) => {
  const query = toQueryString(params);

  const { data } = await clientApi.get(`/api/evaluation/assignedTests${query}`);
  return data;
};

export const findEvaluators = async (params: any) => {
  const query = toQueryString(params);

  const { data } = await clientApi.get(`/api/evaluation/evaluators${query}`);
  return data;
};

export const assignEvaluators = async (testId, da) => {
  const { data } = await clientApi.post(
    `/api/evaluation/assignEvaluators/${testId}`,
    da
  );
  return data;
};

export const removeEvaluators = async (testId, da) => {
  const { data } = await clientApi.post(
    `/api/evaluation/removeEvaluators/${testId}`,
    da
  );
  return data;
};
