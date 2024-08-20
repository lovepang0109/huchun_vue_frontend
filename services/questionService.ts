import clientApi from "@/lib/clientApi";
import { toQueryString } from "@/lib/validator";

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
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const getQuestionByTest = async (testId: any) => {
  try {
    const { data } = await clientApi.get(
      `/api/questions/getByPractice/${testId}`
    );
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const createClassBoard = async (qId: any) => {
  try {
    const res = await clientApi.post(`/api/questions/${qId}/classboard`, {});
    return res.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const getByAttempt = async (id: any) => {
  const { data } = await clientApi.get(`/api/questions/byAttempt/${id}`);
  return data;
};

export const getQuestionFeedbacks = async (params: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(
    `/api/feedbacks/questionFeedback${query}`
  );
  return data;
};

export const testSeriesSummaryBySubject = async (params: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(
    "/api/questions/testSeriesSummaryBySubject/" + query
  );
  return data;
};

export const getQuestionOfDay = async (params: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get("/api/questions/questionOfDay/" + query);
  return data;
};

export const generateQuestions = async (params: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get("/api/questions/generate/" + query);
  return data;
};

export const getErrorLogQuestions = async (params: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get("/api/questions/errorLog" + query);
  return data;
};

export const addErrorLog = async (da: any) => {
  const { data } = await clientApi.post("/api/questions/errorLog", da);
  return data;
};

export const getErrorLogStats = async (params: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get("/api/questions/errorLogStats" + query);
  return data;
};

export const runCodeForQuestion = async (
  questionId,
  code,
  inputs,
  type,
  practiceId,
  attemptDetailId?
) => {
  const codeToExec = {
    code: code,
    testcases: inputs,
  };
  const params = {
    type: type,
    testId: practiceId,
    questionId: questionId,
  };
  if (attemptDetailId) {
    params["attemptDetailId"] = attemptDetailId;
  }

  const query = toQueryString(params);
  const { data } = await clientApi.post(
    "/api/questions/executeCode" + query,
    codeToExec
  );
  return data;
};
