import clientApi from "@/lib/clientApi";
import { toQueryString } from "@/lib/validator";
import { getSession } from "next-auth/react";

export const getQuestionFeedbacks = async (params: any) => {
  const query = toQueryString(params);
  const session = await getSession();
  const { data } = await clientApi.get(
    `https://newapi.practiz.xyz/api/v1/feedbacks/questionFeedback${query}`,
    {
      headers: {
        instancekey: session?.instanceKey,
        Authorization: `bearer ${session?.accessToken}`,
      },
    }
  );
  return data;
};

export const respondFeedback = async (feedback: any, params?: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.post(
    `/api/feedbacks/respondFeedback${query}`,
    feedback
  );
  return data;
};

export const markQuestionResolved = async (questionId: any) => {
  const { data } = await clientApi.put(
    `/api/feedbacks/markQuestionResolved/${questionId}`,
    {}
  );
  return data;
};

export const findAllByPractice = async (practiceSetId: any, $params?: any) => {
  const query = toQueryString($params);
  const { data } = await clientApi.get(
    `/api/feedbacks/byPractice/${practiceSetId}${query}`,
    {}
  );
  return data;
};

export const getTopFeedbacks = async (practiceSetId: any) => {
  const { data } = await clientApi.get(
    `/api/feedbacks/getTopFeedbacks/${practiceSetId}`,
    {}
  );
  return data;
};

export const getQuestionPendingResponses = async (params: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(
    `/api/feedbacks/question/pendingResponses${query}`,
    {}
  );
  return data;
};
