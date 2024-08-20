import clientApi from "@/lib/clientApi";
import { toQueryString } from "@/lib/validator";
import { resolve } from "path/posix";
import { getSession } from "next-auth/react";
import { alert, success, error, confirm } from "alertifyjs";

export const getMine = async (params?: any) => {
  try {
    const query = new URLSearchParams(params).toString();

    const data = await clientApi.get(`/api/subjects/mine/${query}`);

    return data.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const removeQuestion = async (testId: string, questionId: any) => {
  try {
    const data = {
      question: questionId,
      practice: testId,
    };
    const res = await clientApi.get(`/api/tests/removeQuestion`, { data });

    return res.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const updateQuestionOrder = async (
  testId: string,
  question: any,
  newOrder: any
) => {
  try {
    const data = {
      question: question,
      order: newOrder,
    };
    const res = await clientApi.put(`/api/tests/${testId}`, { data });

    return res.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const updateQuestionSection = async (
  testId: string,
  questionId: string,
  section: any
) => {
  try {
    const res = await clientApi.put(`/api/tests/${testId}/${questionId}`, {
      section,
    });

    return res.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};
export const getQuestionList = async (testId: any) => {
  try {
    const res = await clientApi.put(`/api/tests/questionList/${testId}`);

    return res.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const importFunc = async (data: any) => {
  try {
    const session = await getSession();
    const res = await clientApi.post(
      "https://newapi.practiz.xyz/api/v1/tests/import",
      data,
      {
        headers: {
          instancekey: session?.instanceKey,
          Authorization: `bearer ${session?.accessToken}`,
        },
      }
    );
    success("Upload successfully");
  } catch (error) {
    alert("Message", error.response.data.message);
  }
};

export const createFunc = async (practiceset: any) => {
  const { data } = await clientApi.post(`/api/tests`, practiceset);
  return data;
};

export const updateFunc = async (
  practiceId?: any,
  practiceset?: any,
  params?: any
) => {
  delete practiceset.__v;
  const query = toQueryString(params);
  const session = await getSession();
  const { data } = await clientApi.put(
    `https://newapi.practiz.xyz/api/v1/tests/${practiceId}${query}`,
    practiceset,
    {
      headers: {
        instancekey: session?.instanceKey,
        Authorization: `bearer ${session?.accessToken}`,
      },
    }
  );
  return data;
};
