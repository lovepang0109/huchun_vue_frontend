import axios from "axios";
import { getSession, signOut } from "next-auth/react";

const tzOffset = new Date().getTimezoneOffset();

const clientApi = axios.create()

// Add a request interceptor
clientApi.interceptors.request.use(async (request) => {
  request.headers.set("timezoneOffset", tzOffset);
  return request;
});

// Add a response interceptor
clientApi.interceptors.response.use(
  async (response) => {
    return response;
  },
  async function (error) {
    console.log(error)
    if (error.response && error.response.status === 401) {
      signOut({ callbackUrl: "/" });
    }
    return Promise.reject(error);
  }
);

export const apiVersion = "/api/v1";

export const uploadFile = async (file: Blob, fileName: string, uploadType: string) => {
  const formData: FormData = new FormData();
  formData.append("file", file, fileName);
  formData.append("uploadType", uploadType);

  const session = await getSession();

  return await clientApi.post(`${process.env.NEXT_PUBLIC_API}${apiVersion}/files/upload`, formData, {
    headers: {
      instancekey: session?.instanceKey,
      Authorization: `bearer ${session?.accessToken}`
    }
  })
}

export const uploadFileCertificate = async (file: Blob, fileName: string) => {
  const formData: FormData = new FormData();
  formData.append("file", file, fileName);

  const session = await getSession();

  return await clientApi.post(`${process.env.NEXT_PUBLIC_API}${apiVersion}/files/upload/certificate`, formData, {
    headers: {
      instancekey: session?.instanceKey,
      Authorization: `bearer ${session?.accessToken}`
    }
  })
}

export const getClientDataFunc = async () => {
  const { data } = await clientApi.get(`/api/settings`);
  return data;
};

export default clientApi