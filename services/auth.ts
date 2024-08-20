import clientApi from "@/lib/clientApi";
import { toQueryString } from "@/lib/validator";
import { alert, success, error, confirm } from "alertifyjs";
import { getSession } from "next-auth/react";

export const isRequiredDemographic = (demographicData: any, user: any) => {
  let result = false;
  if (demographicData) {
    if (demographicData.identificationNumber && !user.identificationNumber) {
      result = true;
    }
    if (demographicData.rollNumber && !user.rollNumber) {
      result = true;
    }
    if (demographicData.state && !user.state) {
      result = true;
    }
    if (demographicData.city && !user.city) {
      result = true;
    }
    if (demographicData.gender && !user.gender) {
      result = true;
    }
    if (demographicData.dob && !user.birthdate) {
      result = true;
    }
    if (demographicData.passingYear && !user.passingYear) {
      result = true;
    }
    if (demographicData.coreBranch && !user.coreBranch) {
      result = true;
    }
    if (demographicData.collegeName && !user.collegeName) {
      result = true;
    }
    if (
      demographicData.identityVerification &&
      (!user.identityInfo || !user.identityInfo.fileUrl)
    ) {
      result = true;
    }
    if (
      demographicData.field1 &&
      demographicData.field1.value &&
      (!user.field1 || !user.field1.value)
    ) {
      result = true;
    }
    if (
      demographicData.field2 &&
      demographicData.field2.value &&
      (!user.field2 || !user.field2.value)
    ) {
      result = true;
    }
  }

  return result;
};

const getUserSubjects = async () => {
  try {
    const { data } = await clientApi.get(
      `/api/subjects/mine${toQueryString({ unit: true })}`
    );
    return data;
  } catch (error) {
    console.error(error);
    alert("Message", "Fail to load your subjects");
  }
};
export const getToken = () => {
  const token = localStorage.getItem("token");
  return token;
};

export const userId = () => {
  const userId = getUserSubjects();
  return userId;
};

export const getLinkPreview = async (params: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(
    "/api/users/link-preview/" + params._id + query
  );
  return data;
};

export const getReportData = async (api: any, params?: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(`/api/admin/reportData/${api}${query}`);
  return data;
};

export const uploadFile = async (formData: any) => {
  const session = await getSession();

  const { data } = await clientApi.post(
    `${process.env.NEXT_PUBLIC_API}/api/v1/files/upload`,
    formData,
    {
      headers: {
        instancekey: session?.instanceKey,
        Authorization: `bearer ${session?.accessToken}`,
      },
    }
  );
  return data;
};

export const findUsers = async (params: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(`/api/users${query}`);
  return data;
};

export const getUserById = async (user: any) => {
  const query = toQueryString(user);
  const { data } = await clientApi.get(`/api/users/${user.id}${query}`);
  return data;
};

export const getInstitute = async (id, params?) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(`/api/institute/${id}${query}`);
  return data;
};

export const addReferral = async (code) => {
  const { data } = await clientApi.put(`/api/users/addReferral`, { code });
  return data;
};

export const updateInstitute = async (id, params) => {
  const { data } = await clientApi.put(`/api/institute/${id}`, params);
  return data;
};

export const inviteTeachers = async (id, emails) => {
  const { data } = await clientApi.post(`/api/institute/inviteToJoin/${id}`, {
    emails,
  });
  return data;
};

export const changeStatus = async (userId, params) => {
  const { data } = await clientApi.put(
    `/api/users/updateStatus/${userId}`,
    params
  );
  return data;
};

export const addUser = async (user) => {
  const { data } = await clientApi.post(`/api/users/addUser/`, user);
  return data;
};

export const updateUser = async (params) => {
  const { data } = await clientApi.put(
    `/api/users/updateUser/${params._id}`,
    params
  );
  return data;
};

export const addUserInClassroom = async (params) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(
    `/api/users/addUserInClassroom/${params.seqCode}${query}`,
    params
  );
  return data;
};
