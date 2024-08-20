import clientApi from "@/lib/clientApi";
import { getSession } from "next-auth/react";
import { toQueryString } from "@/lib/validator";

export const findServices = async (params) => {
  const query = toQueryString(params);
  const session = await getSession();
  try {
    const { data } = await clientApi.get(
      `https://newapi.practiz.xyz/api/v1/services${query}`,
      {
        headers: {
          instancekey: session?.instanceKey,
          Authorization: `bearer ${session?.accessToken}`,
        },
      }
    );
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const findPublicServices = async (params) => {
  const query = toQueryString(params);
  const session = await getSession();
  try {
    const { data } = await clientApi.get(
      `https://newapi.practiz.xyz/api/v1/services/public${query}`,
      {
        headers: {
          instancekey: session?.instanceKey,
          Authorization: `bearer ${session?.accessToken}`,
        },
      }
    );
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const checkAvailable = async () => {
  const session = await getSession();
  try {
    const { data } = await clientApi.get(
      `https://newapi.practiz.xyz/api/v1/services/checkAvailable`,
      {
        headers: {
          instancekey: session?.instanceKey,
          Authorization: `bearer ${session?.accessToken}`,
        },
      }
    );
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const getService = async (id) => {
  const session = await getSession();
  try {
    const { data } = await clientApi.get(
      `https://newapi.practiz.xyz/api/v1/services/${id}`,
      {
        headers: {
          instancekey: session?.instanceKey,
          Authorization: `bearer ${session?.accessToken}`,
        },
      }
    );
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const getTaggingServicesForStudents = async (
  idList,
  refresh = false
) => {
  const now = new Date();
  let loadedServices: any = {};
  // cache each user 30 mins
  let needToLoadStudents = idList;
  if (!refresh) {
    needToLoadStudents = idList.filter(
      (s) =>
        !loadedServices[s] || +now - +loadedServices[s].date > 30 * 60 * 1000
    );
    if (!needToLoadStudents.length) {
      return loadedServices;
    }
  }
  const session = await getSession();
  try {
    const { data } = await clientApi.post(
      `https://newapi.practiz.xyz/api/v1/services/getTaggingForStudents`,
      {
        students: needToLoadStudents,
      },
      {
        headers: {
          instancekey: session?.instanceKey,
          Authorization: `bearer ${session?.accessToken}`,
        },
      }
    );
    data.forEach((u) => {
      loadedServices[u._id] = {
        services: u.services,
        date: new Date(),
      };
    });
    return loadedServices;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const getTaggingServicesForStudent = async (studentId) => {
  const session = await getSession();
  try {
    const { data } = await clientApi.get(
      `https://newapi.practiz.xyz/api/v1/services/tagging/${studentId}`,
      {
        headers: {
          instancekey: session?.instanceKey,
          Authorization: `bearer ${session?.accessToken}`,
        },
      }
    );
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const getMembers = async (serviceId, params) => {
  const query = toQueryString(params);
  const session = await getSession();
  try {
    const { data } = await clientApi.get(
      `https://newapi.practiz.xyz/api/v1/services/${serviceId}/members${query}`,
      {
        headers: {
          instancekey: session?.instanceKey,
          Authorization: `bearer ${session?.accessToken}`,
        },
      }
    );
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const createService = async (service) => {
  const session = await getSession();
  try {
    const { data } = await clientApi.post(
      `https://newapi.practiz.xyz/api/v1/services`,
      service,
      {
        headers: {
          instancekey: session?.instanceKey,
          Authorization: `bearer ${session?.accessToken}`,
        },
      }
    );
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const updateService = async (service) => {
  const session = await getSession();
  try {
    const { data } = await clientApi.put(
      `https://newapi.practiz.xyz/api/v1/services/${service._id}`,
      service,
      {
        headers: {
          instancekey: session?.instanceKey,
          Authorization: `bearer ${session?.accessToken}`,
        },
      }
    );
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const revokeService = async (service) => {
  const session = await getSession();
  try {
    const { data } = await clientApi.put(
      `https://newapi.practiz.xyz/api/v1/services/${service._id}/revoke`,
      { _id: service._id },
      {
        headers: {
          instancekey: session?.instanceKey,
          Authorization: `bearer ${session?.accessToken}`,
        },
      }
    );
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const publishService = async (service) => {
  const session = await getSession();
  try {
    const { data } = await clientApi.put(
      `https://newapi.practiz.xyz/api/v1/services/${service._id}/publish`,
      { _id: service._id },
      {
        headers: {
          instancekey: session?.instanceKey,
          Authorization: `bearer ${session?.accessToken}`,
        },
      }
    );
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const deleteService = async (service) => {
  const session = await getSession();
  try {
    const { data } = await clientApi.delete(
      `https://newapi.practiz.xyz/api/v1/services/${service._id}`,
      {
        headers: {
          instancekey: session?.instanceKey,
          Authorization: `bearer ${session?.accessToken}`,
        },
      }
    );
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const getLicenseSummary = async () => {
  const { data } = await clientApi.get(`/api/services/licenseSummary`);
  return data;
};

export const getOndemandTransactionHistory = async () => {
  const { data } = await clientApi.get(
    `/api/services/ondemandTransactionHistory`
  );
  return data;
};

export const getUsedLicenses = async (params?) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(
    `/api/services/usedLicenses${query}`
  );
  return data;
}
