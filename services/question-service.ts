import clientApi from "@/lib/clientApi";
import { alert, success, error, confirm } from "alertifyjs";
import { toQueryString } from "@/lib/validator";
import { getSession } from "next-auth/react";

export const updateTags = async (
  questions: any,
  tags: any,
  searchParams: any | null = null,
  mode = "replace"
) => {
  try {
    const data: any = { questions, tags, mode };
    if (searchParams) {
      data.searchParams = searchParams;
    }
    const res = await clientApi.post(`/api/questions/tags`, data);
    return res;
  } catch (err) {
    error("Failed to add tags.");
  }
};

export const getQuestionByTest = async (testId: any) => {
  try {
    const res = await clientApi.get(`/api/questions/getByPractice/${testId}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const createClassBoard = async (qId: any) => {
  try {
    const res = await clientApi.post(`/api/questions/${qId}/classroom`, {});
    return res.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const create = async (params: any) => {
  try {
    const res = await clientApi.post(`/api/questions`, params);
    return res.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const updateQuestion = async (qid: any, data: any) => {
  try {
    const session = await getSession();

    const res = await clientApi.put(
      `https://newapi.practiz.xyz/api/v1/questions/${qid}`,
      data,
      {
        headers: {
          instancekey: session?.instanceKey,
          Authorization: `bearer ${session?.accessToken}`,
        },
      }
    );
    success("Question is updated successfully.");
    return res.data;
  } catch (err: any) {
    if (err.error && err.error.message) {
      error(err.error.message);
    } else {
      alert("Message", "Fail to update question");
    }
    console.error("Error fetching data:", error);
  }
};

export const importAllQuestionsFromSearch = async (
  practiceId: any,
  searchParams: any
) => {
  try {
    searchParams.reUse = true;
    const params = {
      practice: practiceId,
      fromSearch: true,
      searchParams: searchParams,
    };
    const res = await clientApi.post(`/api/tests/importQuestion`, params);
    success("Questions are imported.");

    return res.data;
  } catch (error) {
    alert("Message", "Fail to import questions to this test.");

    console.error("Error fetching data:", error);
  }
};

export const importQuestion = async (practiceId: any, questionIds: any) => {
  try {
    const params = {
      practice: practiceId,
      questions: questionIds,
    };
    const res = await clientApi.post(`/api/tests/importQuestion`, params);
    return res.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const destroy = async (questionId: any, params?: any) => {
  try {
    const query = toQueryString(params);
    const session = await getSession();

    const res = await clientApi.delete(
      `https://newapi.practiz.xyz/api/v1/questions/${questionId}${query}`,
      {
        headers: {
          instancekey: session?.instanceKey,
          Authorization: `bearer ${session?.accessToken}`,
        },
      }
    );
    success("Question is deleted successfully.");

    return res.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    alert("Messate", "You are not authorized to perform this action");
  }
};

export const getBankQuestions = async (params: any) => {
  try {
    if (!params) {
      params = {};
    }
    params.reUse = true;

    const res = await clientApi.post(`/api/questions/search`, params);
    return res.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};
export const runCode = async (
  codeData: any,
  code: any,
  inputs?: any,
  timeLimit?: any,
  memLimit?: any
) => {
  const codeToExec: any = {
    code: code,
    testcases: inputs,
  };

  if (timeLimit) {
    codeToExec.timeLimit = timeLimit;
  }
  if (memLimit) {
    codeToExec.memLimit = memLimit;
  }

  return await clientApi.post(
    "/api/questions/executeCode?type=" + codeData.language,
    codeToExec
  );
};

export const generateTestCases = async (da: any, params: any) => {
  const query = toQueryString(params);

  const { data } = await clientApi.post(
    `/api/questions/generateTestCases${query}`,
    da
  );
  return data;
};
export const getQ = async (qid: any, params?: any) => {
  try {
    const query = toQueryString(params);
    const res = await clientApi.get(`/api/questions/${qid}/show${query}`);
    return res.data;
  } catch (error) {
    console.error(error);
  }
};
export const getQuestionPerformanceByTest = async (
  qid: any,
  testId: any,
  params?: any
) => {
  try {
    const query = toQueryString(params);
    const session = await getSession();

    const res = await clientApi.get(
      `https://newapi.practiz.xyz/api/v1/questions/${qid}/performanceByTest/${testId}${query}`,
      {
        headers: {
          instancekey: session?.instanceKey,
          Authorization: `bearer ${session?.accessToken}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error(error);
  }
};

export const getByAttempt = async (id: any) => {
  try {
    const res = await clientApi.get(`/api/questions/byAttempt/${id}`);
    return res.data;
  } catch (error) {
    console.error(error);
  }
};

export const getQuestionUnits = async (params: any) => {
  const { data } = await clientApi.post(`/api/questions/units`, {
    searchParams: params,
  });
  return data;
};

export const personalTopicAnalysis = async (qid: any) => {
  const { data } = await clientApi.get(
    `/api/questions/${qid}/personalTopicAnalysis`
  );
  return data;
};
