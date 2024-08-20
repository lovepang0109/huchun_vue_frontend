import clientApi from "@/lib/clientApi";
import { toQueryString } from "@/lib/validator";
import { getSession } from "next-auth/react";

export const enrollItems = async (params: any) => {
  const { data } = await clientApi.post(`/api/payments/enrollItems`, params);
  return data;
};
