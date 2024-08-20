import clientApi from "@/lib/clientApi";
import { alert, success, error, confirm } from "alertifyjs";
import { toQueryString } from "@/lib/validator";
import { getSession } from "next-auth/react";

export const getClassrooms = async () => {
  const session = await getSession();
  try {
    const data = await clientApi.get(
      `${process.env.NEXT_PUBLIC_API_HOST}${process.env.NEXT_PUBLIC_API_VERSION}/student/classrooms`,
      {
        headers: {
          instancekey: session?.instanceKey,
          Authorization: `bearer ${session?.accessToken}`,
        },
      }
    );
    return data.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const recommendedTests = async (params) => {
  const query = toQueryString(params);
  const session = await getSession();
  try {
    const data = await clientApi.get(
      `${process.env.NEXT_PUBLIC_API_HOST}/api/v1/student/recommendedTests${query}`,
      {
        headers: {
          instancekey: session?.instanceKey,
          Authorization: `bearer ${session?.accessToken}`,
        },
      }
    );
    return data.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const takeTestsAgain = async (params) => {
  const query = toQueryString(params);
  const session = await getSession();
  try {
    const data = await clientApi.get(
      `${process.env.NEXT_PUBLIC_API_HOST}/api/v1/student/takeTestsAgain${query}`,
      {
        headers: {
          instancekey: session?.instanceKey,
          Authorization: `bearer ${session?.accessToken}`,
        },
      }
    );
    return data.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const recommendedTest = async (params) => {
  const query = toQueryString(params);
  const session = await getSession();
  try {
    const data = await clientApi.get(
      `${process.env.NEXT_PUBLIC_API_HOST}${process.env.NEXT_PUBLIC_API_VERSION}/student/recommendedTests${query}`,
      {
        headers: {
          instancekey: session?.instanceKey,
          Authorization: `bearer ${session?.accessToken}`,
        },
      }
    );
    return data.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const attemptsSummary = async (params) => {
  const query = toQueryString(params);
  const session = await getSession();
  try {
    const data = await clientApi.get(
      `${process.env.NEXT_PUBLIC_API_HOST}${process.env.NEXT_PUBLIC_API_VERSION}/student/attemptSummary${query}`,
      {
        headers: {
          instancekey: session?.instanceKey,
          Authorization: `bearer ${session?.accessToken}`,
        },
      }
    );
    return data.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const attemptSubjects = async (params) => {
  const query = toQueryString(params);
  const session = await getSession();
  try {
    const data = await clientApi.get(
      `${process.env.NEXT_PUBLIC_API_HOST}${process.env.NEXT_PUBLIC_API_VERSION}/student/attemptSubjects${query}`,
      {
        headers: {
          instancekey: session?.instanceKey,
          Authorization: `bearer ${session?.accessToken}`,
        },
      }
    );
    return data.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const textualAnalysis = async (params) => {
  const query = toQueryString(params);
  const session = await getSession();
  try {
    const data = await clientApi.get(
      `${process.env.NEXT_PUBLIC_API_HOST}${process.env.NEXT_PUBLIC_API_VERSION}/student/textualAnalysis${query}`,
      {
        headers: {
          instancekey: session?.instanceKey,
          Authorization: `bearer ${session?.accessToken}`,
        },
      }
    );
    return data.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const summaryByNumber = async (params) => {
  const query = toQueryString(params);
  try {
    const data = await clientApi.get(`/api/student/summaryByNumber${query}`);
    return data.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const getUniqueQuestionsCount = async (params) => {
  const query = toQueryString(params);
  try {
    const data = await clientApi.get(
      `/api/student/getUniqueQuestionsCount${query}`
    );
    return data.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const topperSummaryByNumber = async (params) => {
  const query = toQueryString(params);
  try {
    const data = await clientApi.get(
      `/api/student/topperSummaryByNumber${query}`
    );
    return data.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const getAverageTimeOnPlatform = async (params) => {
  const query = toQueryString(params);
  try {
    const data = await clientApi.get(
      `/api/student/getAverageTimeOnPlatform${query}`
    );
    return data.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const getEffortTrendAttemptCount = async (params) => {
  const query = toQueryString(params);
  try {
    const data = await clientApi.get(
      `/api/student/getEffortTrendAttemptCount${query}`
    );
    return data.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const getLearningEffortDistribution = async (params) => {
  const query = toQueryString(params);
  try {
    const data = await clientApi.get(
      `/api/student/getLearningEffortDistribution${query}`
    );
    return data.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const getPracticeEffortDistribution = async (params) => {
  const query = toQueryString(params);
  const session = await getSession();
  try {
    const data = await clientApi.get(
      `${process.env.NEXT_PUBLIC_API_HOST}${process.env.NEXT_PUBLIC_API_VERSION}/student/getPracticeEffortDistribution${query}`,
      {
        headers: {
          instancekey: session?.instanceKey,
          Authorization: `bearer ${session?.accessToken}`,
        },
      }
    );
    return data.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const getSubjectQuestionComplexity = async (params) => {
  const query = toQueryString(params);
  try {
    const data = await clientApi.get(
      `/api/student/getSubjectQuestionComplexity${query}`
    );
    return data.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const questionCategoryDistribution = async (params) => {
  const query = toQueryString(params);
  try {
    const data = await clientApi.get(
      `/api/student/questionCategoryDistribution${query}`
    );
    return data.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const getGroupParticipation = async (params) => {
  const query = toQueryString(params);
  const session = await getSession();
  try {
    const data = await clientApi.get(
      `${process.env.NEXT_PUBLIC_API_HOST}${process.env.NEXT_PUBLIC_API_VERSION}/student/getGroupParticipation${query}`,
      {
        headers: {
          instancekey: session?.instanceKey,
          Authorization: `bearer ${session?.accessToken}`,
        },
      }
    );
    return data.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const getPersistanceData = async (params) => {
  const query = toQueryString(params);
  try {
    const data = await clientApi.get(`/api/student/getPersistanceData${query}`);
    return data.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const getEffortTrendAttemptTotalTime = async (params) => {
  const query = toQueryString(params);
  const session = await getSession();
  try {
    const data = await clientApi.get(
      `${process.env.NEXT_PUBLIC_API_HOST}${process.env.NEXT_PUBLIC_API_VERSION}/student/getEffortTrendAttemptTotalTime${query}`,
      {
        headers: {
          instancekey: session?.instanceKey,
          Authorization: `bearer ${session?.accessToken}`,
        },
      }
    );
    return data.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const getEffortTrendCourseTimeSpent = async (params) => {
  const query = toQueryString(params);
  const session = await getSession();
  try {
    const data = await clientApi.get(
      `${process.env.NEXT_PUBLIC_API_HOST}${process.env.NEXT_PUBLIC_API_VERSION}/student/getEffortTrendCourseTimeSpent${query}`,
      {
        headers: {
          instancekey: session?.instanceKey,
          Authorization: `bearer ${session?.accessToken}`,
        },
      }
    );
    return data.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const getAccuracyAndSpeed = async (params) => {
  const query = toQueryString(params);
  const session = await getSession();
  try {
    const data = await clientApi.get(
      `${process.env.NEXT_PUBLIC_API_HOST}${process.env.NEXT_PUBLIC_API_VERSION}/student/accuracyAndSpeed${query}`,
      {
        headers: {
          instancekey: session?.instanceKey,
          Authorization: `bearer ${session?.accessToken}`,
        },
      }
    );
    return data.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const getAccuracyAndSpeedByTopic = async (params) => {
  const query = toQueryString(params);
  const session = await getSession();
  try {
    const data = await clientApi.get(
      `${process.env.NEXT_PUBLIC_API_HOST}${process.env.NEXT_PUBLIC_API_VERSION}/student/accuracyAndSpeedByTopic${query}`,
      {
        headers: {
          instancekey: session?.instanceKey,
          Authorization: `bearer ${session?.accessToken}`,
        },
      }
    );
    return data.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const getStudentAttempts = async (studentId, params) => {
  const query = toQueryString(params);
  const session = await getSession();
  try {
    const data = await clientApi.get(
      `${process.env.NEXT_PUBLIC_API_HOST}${process.env.NEXT_PUBLIC_API_VERSION}/student/attempts/${studentId}${query}`,
      {
        headers: {
          instancekey: session?.instanceKey,
          Authorization: `bearer ${session?.accessToken}`,
        },
      }
    );
    return data.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const countStudentAttempts = async (studentId, params) => {
  const query = toQueryString(params);
  const session = await getSession();
  try {
    const data = await clientApi.get(
      `${process.env.NEXT_PUBLIC_API_HOST}${process.env.NEXT_PUBLIC_API_VERSION}/student/countAttempts/${studentId}${query}`,
      {
        headers: {
          instancekey: session?.instanceKey,
          Authorization: `bearer ${session?.accessToken}`,
        },
      }
    );
    return data.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};
export const checkAllowAdd = async (body: any) => {
  const session = await getSession();

  const { data } = await clientApi.post(
    `https://newapi.practiz.xyz/api/v1/classRooms/checkAllowAdd
  `,
    body,
    {
      headers: {
        instancekey: session?.instanceKey,
        Authorization: `bearer ${session?.accessToken}`,
      },
    }
  );
  return data;
};

export const addStudent = async (classroom: any) => {
  const session = await getSession();

  const { data } = await clientApi.post(
    `https://newapi.practiz.xyz/api/v1/classRooms/addStudent
    `,
    classroom,
    {
      headers: {
        instancekey: session?.instanceKey,
        Authorization: `bearer ${session?.accessToken}`,
      },
    }
  );
  return data;
};

export const uploadStudent = async (formData: any) => {
  const session = await getSession();

  const { data } = await clientApi.post(
    `https://newapi.practiz.xyz/api/v1/classRooms/importStudent`,
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

export const removeStudent = async (body: any) => {
  const session = await getSession();

  const { data } = await clientApi.post(
    `https://newapi.practiz.xyz/api/v1/classRooms/removeStudent`,
    body,
    {
      headers: {
        instancekey: session?.instanceKey,
        Authorization: `bearer ${session?.accessToken}`,
      },
    }
  );
  return data;
};

export const readdStudent = async (body: any) => {
  const { data } = await clientApi.post(`/api/classRooms/readdStudent`, body);
  return data;
};

export const getSubjectWiseSpeedAndAccuracy = async (params?: any) => {
  const session = await getSession();

  const { data } = await clientApi.get(
    `https://newapi.practiz.xyz/api/v1/student/getSubjectWiseSpeedAndAccuracy${toQueryString(
      params
    )}`,
    {
      headers: {
        instancekey: session?.instanceKey,
        Authorization: `bearer ${session?.accessToken}`,
      },
    }
  );
  return data;
};

export const getPracticeEffort = async (subjectId: string, userId = "") => {
  const query = toQueryString({ subject: subjectId, user: userId });
  const { data } = await clientApi.get(
    `/api/analysis/getPracticeEffort${query}`
  );
  return data;
};

export const getAttempt = async (attemptId: any, params?: any) => {
  const session = await getSession();

  const query = toQueryString(params);
  const { data } = await clientApi.get(
    `https://newapi.practiz.xyz/api/v1/student/attempts/${attemptId}/summary${query}`,
    {
      headers: {
        instancekey: session?.instanceKey,
        Authorization: `bearer ${session?.accessToken}`,
      },
    }
  );
  return data;
};

export const getTopicsUserExceedAvgTime = async (
  subjectId: string,
  userId = ""
) => {
  const query = toQueryString({ subject: subjectId, user: userId });
  const { data } = await clientApi.get(
    `/api/analysis/getTopicsUserExceedAvgTime${query}`
  );
  return data;
};

export const getSATandACTscores = async (params?: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(
    `/api/student/getSATandACTscores${query}`
  );
  return data;
};

export const getPublicAttempt = async (attemptId: any, params?: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(
    `/api/student/attempts/${attemptId}/public${query}`
  );
  return data;
};

export const getAverageAttempt = async (practicesetId: any, params?: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(
    `/api/student/averageAttempt/${practicesetId}/summary${query}`
  );
  return data;
};

export const getBestAttempt = async (practicesetId: any, params?: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(
    `/api/student/bestAttempt/${practicesetId}/summary${query}`
  );
  return data;
};

export const getAccuracyPercentile = async (attemptId: any, params?: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(
    `/api/student/attempts/${attemptId}/percentile${query}`
  );
  return data;
};

export const getSatScore = async (attemptId: any) => {
  const { data } = await clientApi.get(`/api/student/satScore/${attemptId}`);
  return data;
};

export const getActScore = async (attemptId: any) => {
  const { data } = await clientApi.get(`/api/student/actScore/${attemptId}`);
  return data;
};

export const satToAct = async (attemptId: any, params?: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(
    `/api/student/satToAct/${attemptId}${query}`
  );
  return data;
};

export const actToSat = async (attemptId: any, params?: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(
    `/api/student/actToSat/${attemptId}${query}`
  );
  return data;
};
