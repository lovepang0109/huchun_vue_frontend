import clientApi from "@/lib/clientApi";
import { toQueryString } from "@/lib/validator";

export const uploadFileWithProgress = async (formData: FormData, params?) => {
  const query = toQueryString(params);
  const { data } = await clientApi.post(
    `/api/files/upload${query}`,
    formData,
    { reportProgress: true, observe: "events" }
  );
  return data;
};
