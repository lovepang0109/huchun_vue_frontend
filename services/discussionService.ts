import { date } from "./../lib/pipe";
import clientApi from "@/lib/clientApi";
import { toQueryString } from "@/lib/validator";

export const createDiscussionRespond = async (
  feedbackId: any,
  message: any
) => {
  const { data } = await clientApi.post(
    `/api/discussions/createDiscussionRespond/${feedbackId}`,
    message
  );
  return data;
};
export const getQuestionFeedbacks = async (params: any) => {
  const query = toQueryString(params);
  try {
    const { data } = await clientApi.get(
      `/api/feedbacks/questionFeedback${query}`
    );

    return data;
  } catch (err) {
    console.error(err);
  }
};

export const getPosts = async (params: any) => {
  const { data } = await clientApi.post(`/api/discussions`, params);
  return data;
};

export const post = async (message: any) => {
  const { data } = await clientApi.post(`/api/discussions`, message);
  return data;
};

export const comment = async (postId: any, message: any) => {
  const { data } = await clientApi.post(`/api/discussions/${postId}`, message);
  return data;
};

export const getComments = async (postId: any, params?: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(
    `/api/discussions/comments/${postId}/comments${query}`
  );
  return data;
};

export const deleteFunc = async (postId: any) => {
  const { data } = await clientApi.delete(`/api/discussions/${postId}`);
  return data;
};

export const getCourseDiscussions = async (courseId: any, params: any) => {
  const { data } = await clientApi.get(
    `/api/discussions/course/${courseId}${toQueryString(params)}`
  );
  return data;
};

export const editPost = async (postId: any, description: any) => {
  const { data } = await clientApi.put(
    `/api/discussions/${postId}`,
    description,
    {
      responseType: "text",
    }
  );
  return data;
};

export const unvotePost = async (postId: any) => {
  const { data } = await clientApi.put(`/api/discussions/${postId}/unvote`, {
    postId: postId,
  });
  return data;
};
export const votePost = async (postId: any) => {
  const { data } = await clientApi.put(`/api/discussions/${postId}/vote`, {
    postId: postId,
  });
  return data;
};

export const savedPost = async (id: any) => {
  const { data } = await clientApi.put(`/api/discussions/savePost/${id}`, id);
  return data;
};

export const flag = async (id: any) => {
  const { data } = await clientApi.put(`/api/discussions/flag/${id}`, {});
  return data;
};

export const unflag = async (id: any) => {
  const { data } = await clientApi.put(`/api/discussions/unflag/${id}`, {});
  return data;
};
export const getClassroomPosts = async (classroomId: string, params: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(
    `/api/discussions/classroom/${classroomId}${query}`
  );

  return data;
};

export const unsavedPost = async (id: any) => {
  const { data } = await clientApi.put(
    `/api/discussions/unsavedPost/${id}`,
    id
  );
  return data;
};

export const getFlaggedPosts = async (params: any) => {
  const { data } = await clientApi.get(
    `/api/discussions/flaggedPosts${toQueryString(params)}`
  );
  return data;
};

export const getOneFlaggedPost = async (id: any) => {
  const { data } = await clientApi.get(`/api/discussions/flaggedPosts/${id}`);
  return data;
};
