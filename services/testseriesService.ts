import clientApi from "@/lib/clientApi";
import { toQueryString } from "@/lib/validator";
import { getSession } from "next-auth/react";

export const find = async (params: any) => {
  const session = await getSession();

  const query = toQueryString(params);
  const { data } = await clientApi.get(
    `https://newapi.practiz.xyz/api/v1/testSeries/find${query}`,
    {
      headers: {
        instancekey: session?.instanceKey,
        Authorization: `bearer ${session?.accessToken}`,
      },
    }
  );
  return data;
};

export const findAllSummary = async ($params: any) => {
  const query = toQueryString($params);
  const { data } = await clientApi.get(
    `/api/testSeries/summaryPackages${query}`
  );
  return data;
};

export const findAllSummaryByStudent = async ($params: any) => {
  const query = toQueryString($params);
  const { data } = await clientApi.get(
    `/api/testSeries/summaryPackagesByStudent${query}`
  );
  return data;
};

export const countPackages = async ($params: any) => {
  const query = toQueryString($params);
  const { data } = await clientApi.get(`/api/testSeries/countPackages${query}`);
  return data;
};
export const countPackagesByStudent = async ($params: any) => {
  const query = toQueryString($params);
  const { data } = await clientApi.get(
    `/api/testSeries/student/countPackages${query}`
  );
  return data;
};

export const getByPractice = async (practiceId: any) => {
  const { data } = await clientApi.get(
    `/api/testSeries/getByPractice/${practiceId}`
  );
  return data;
};

export const getTotalStudent = async (testseriesId: any) => {
  const { data } = await clientApi.get(
    `/api/testSeries/getTotalStudent/${testseriesId}`
  );
  return data;
};

export const getSummary = async (testseriesId: any, params?: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(
    `/api/testSeries/summary/${testseriesId}${query}`
  );
  return data;
};

export const getPublicSummary = async (testseriesId: any) => {
  const { data } = await clientApi.get(
    `/api/testSeries/public/${testseriesId}`
  );
  return data;
};

export const findAllSummaryByTeacher = async ($params: any) => {
  const query = toQueryString($params);
  const { data } = await clientApi.get(
    `/api/testSeries/summaryPackagesByTeacher${query}`
  );
  return data;
};

export const countPackagesByTeacher = async ($params: any) => {
  const query = toQueryString($params);
  const { data } = await clientApi.get(
    `/api/testSeries/teacher/countPackages${query}`
  );
  return data;
};

export const deleteFun = async (testseriesId: any) => {
  const { data } = await clientApi.delete(`/api/testSeries/${testseriesId}`);
  return data;
};

export const create = async (testSeries: any) => {
  const session = await getSession();

  const { data } = await clientApi.post(
    `https://newapi.practiz.xyz/api/v1/testSeries/`,
    testSeries,
    {
      headers: {
        instancekey: session?.instanceKey,
        Authorization: `bearer ${session?.accessToken}`,
      },
    }
  );
  return data;
};

export const publish = async (id: string, series?: any) => {
  const { data } = await clientApi.put(`/api/testSeries/publish/${id}`, series);
  return data;
};

export const revoke = async (id: string, series: any) => {
  const { data } = await clientApi.put(`/api/testSeries/revoke/${id}`, series);
  return data;
};

export const update = async (id: any, testSeries: any) => {
  const { data } = await clientApi.put(`/api/testSeries/${id}`, testSeries);
  return data;
};

export const addTest = async (id: string, testId: string) => {
  const { data } = await clientApi.put(`/api/testSeries/addTest/${id}`, {
    testId,
  });
  return data;
};

export const removeTest = async (id: string, testId: string) => {
  const { data } = await clientApi.put(`/api/testSeries/removeTest/${id}`, {
    testId,
  });
  return data;
};

export const boughtTestSeriesByOthers = async (params: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(
    "/api/testSeries/boughtTestSeriesByOthers" + query
  );
  return data;
};

export const getPackageAttemptCount = async (id: any, $params: any) => {
  const query = toQueryString($params);
  const { data } = await clientApi.get(
    "/api/testSeries/getPackageAttemptCount/" + id + query
  );
  return data;
};

export const recommendedTestSeries = async (params: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(
    "/api/testSeries/recommendedTestSeries" + query
  );
  return data;
};

export const myTestSeries = async (params?: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(
    "/api/testSeries/myBoughtTestSeries" + query
  );
  return data;
};
export const addFavorite = async (id: any) => {
  const { data } = await clientApi.put("/api/testSeries/addfavorite/" + id, {});
  return data;
};
export const removeFavorite = async (id: any) => {
  const { data } = await clientApi.delete(
    "/api/testSeries/removefavorite/" + id
  );
  return data;
};
export const getFavorites = async () => {
  const { data } = await clientApi.get(`/api/testSeries/favorites`);
  return data;
};
export const getAuthors = async () => {
  const session = await getSession();

  const { data } = await clientApi.get(
    "https://newapi.practiz.xyz/api/v1/testSeries/authors",
    {
      headers: {
        instancekey: session?.instanceKey,
        Authorization: `bearer ${session?.accessToken}`,
      },
    }
  );
  return data;
};
export const getSubjects = async (params?: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(`/api/testSeries/subjects` + query);
  return data;
};
export const getBestSeller = async (params?: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(`/api/testSeries/bestSeller` + query);
  return data;
};
export const getMostPopular = async (params?: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(
    `/api/testSeries/teacher/mostPopular` + query
  );
  return data;
};
export const getHighestPaid = async (params?: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(
    `/api/testSeries/teacher/highestPaid` + query
  );
  return data;
};
export const getTeacherSummary = async (id: any) => {
  const { data } = await clientApi.get(`/api/testSeries/teacher/summary/${id}`);
  return data;
};
export const getOngoingClasses = async (id: any) => {
  const { data } = await clientApi.get(`/api/testSeries/ongoingClasses/${id}`);
  return data;
};

// analytics
export const getStudentRank = async (id: any) => {
  const { data } = await clientApi.get(`/api/testSeries/getStudentRank/${id}`);
  return data;
};
export const percentCompleteTestseries = async (id: any, params?: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(
    `/api/testSeries/percentCompleteTestseries/${id}${query}`
  );
  return data;
};
export const percentAccuracyTestseries = async (id: any, params?: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(
    `/api/testSeries/percentAccuracyTestseries/${id}${query}`
  );
  return data;
};
export const practiceHoursTestSeries = async (id: any, params?: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(
    `/api/testSeries/practiceHoursTestSeries/${id}${query}`
  );
  return data;
};
export const questionCategoryTestSeries = async (id: any, params?: any) => {
  const query = toQueryString(params);

  const { data } = await clientApi.get(
    `/api/testSeries/questionCategoryTestSeries/${id}${query}`
  );
  return data;
};

export const subjectWiseMarksTestSeries = async (id: any, params?: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(
    `/api/testSeries/subjectWiseMarksTestSeries/${id}${query}`
  );
  return data;
};

export const assesmentWiseMarksTestSeries = async (id: any, params?: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(
    `/api/testSeries/assesmentWiseMarksTestSeries/${id}${query}`
  );
  return data;
};

export const testOrder = async (id: any, test: any, newOrder: any) => {
  const { data } = await clientApi.put("/api/testSeries/" + id + "/testOrder", {
    test: test,
    order: newOrder,
  });
  return data;
};

export const removeClassroom = async (id: any, classroomId: any) => {
  const { data } = await clientApi.put(
    `/api/testSeries/${id}/removeClassroom`,
    {
      classroom: classroomId,
    }
  );
  return data;
};

export const searchForMarketPlace = async (params: any) => {
  const query = toQueryString(params);

  const { data } = await clientApi.get(
    `/api/testSeries/searchForMarketPlace${query}`
  );
  return data;
};

export const getPublicListing = async (params: any) => {
  const { data } = await clientApi.get(
    `/api/testSeries/public${toQueryString(params)}`
  );
  return data;
};
export const getPublisherTestseries = async (params: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(
    `/api/testSeries/getPublisherTestseries${query}`
  );
  return data;
};

export const getByClassroom = async (classId: any, params?: any) => {
  const query = toQueryString(params);

  const { data } = await clientApi.get(
    `/api/testSeries/getByClassroom/${classId}${query}`
  );
  return data;
};

export const getClassroomAnalytics = async (
  id: any,
  classId: any,
  params?: any
) => {
  const query = toQueryString(params);

  const { data } = await clientApi.get(
    `/api/testSeries/analytics/${id}/classroom/${classId}${query}`
  );
  return data;
};

export const getStudents = async (id: any, params?: any) => {
  const query = toQueryString(params);

  const { data } = await clientApi.get(
    `/api/testSeries/students/${id}${query}`
  );
  return data;
};

export const getInactiveStudents = async (id: any, params?: any) => {
  const query = toQueryString(params);

  const { data } = await clientApi.get(
    `/api/testSeries/analytics/${id}/inactiveStudents${query}`
  );
  return data;
};
export const getUltilization = async (id: any, params?: any) => {
  const query = toQueryString(params);

  const { data } = await clientApi.get(
    `/api/testSeries/analytics/${id}/ultilization${query}`
  );
  return data;
};
export const ignoreInactive = async (id: any, studentId: any) => {
  const { data } = await clientApi.put("/api/testSeries/ignoreInactive/" + id, {
    student: studentId,
  });
  return data;
};
export const remindInactive = async (
  id: any,
  studentId: any,
  sendEmail: any
) => {
  const { data } = await clientApi.put("/api/testSeries/remindInactive/" + id, {
    student: studentId,
    sendEmail: sendEmail,
  });
  return data;
};
