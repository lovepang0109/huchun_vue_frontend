import clientApi from "@/lib/clientApi";
import { toQueryString } from "@/lib/validator";
import { getSession } from "next-auth/react";

export const find = async (params?: any) => {
  const session = await getSession();

  const query = toQueryString(params);
  const { data } = await clientApi.get(
    `https://newapi.practiz.xyz/api/v1/locations/${query}`,
    {
      headers: {
        instancekey: session?.instanceKey,
        Authorization: `bearer ${session?.accessToken}`,
      },
    }
  );
  return data;
};
