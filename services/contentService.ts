import clientApi from "@/lib/clientApi";
import { toQueryString } from "@/lib/validator";
import { Content } from "next/font/google";

export const getContentById = async (id: any) => {
  const { data } = await clientApi.get(`/api/contents/${id}`);
  return data;
};

export const count = async ($params: any) => {
  const query = toQueryString($params);
  const { data } = await clientApi.get(`/api/contents/count${query}`);
  return data;
};

export const findAll = async ($params: any) => {
  const query = toQueryString($params);
  const { data } = await clientApi.get(`/api/contents${query}`);
  return data;
};

export const getContentsTaggedWithTopic = async (topicId: string, params: any) => {
  const query = toQueryString(params);
  const {data} = await clientApi.get(`/api/contents/taggedWithTopic/${topicId}${query}`);
  return data
}

export const updateCount = async (content: any) => {
  const {data} = await clientApi.put(`/api/updateCount/${content.id}`, content);
  return data
}