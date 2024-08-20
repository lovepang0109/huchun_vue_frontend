import clientApi from "@/lib/clientApi";
import { toQueryString } from "@/lib/validator";
import { alert, success, error, confirm } from "alertifyjs";
import { getSession } from "next-auth/react";

export const saveAs = async (id: string, data: any) => {
  try {
    const res = await clientApi.put(`/api/tests/saveAs/${id}`, data);
    return res;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const exportPDF = async (testId: string, hasAnswers: boolean) => {
  let url = `/api/tests/exportPDF/${testId}?directDownload=true`;
  if (hasAnswers) {
    url += "&hasAnswers=true";
  }

  try {
    const response = await clientApi.get(url, {
      responseType: "blob",
    });

    const fileName =
      response.headers["content-disposition"].split("filename=")[1];
    return { fileName: fileName, blob: response.data };
  } catch (error) {
    console.error("Error exporting PDF:", error);
    // Handle errors as needed
  }
};

export const fraudCheck = async (testId: string) => {
  try {
    const data = await clientApi.get(`/api/tests/fraudCheck/${testId}`);
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const updateAllQuestionSection = async (
  testId: string,
  section: any
) => {
  try {
    const data = await clientApi.put(
      `/api/tests/${testId}/allSection`,
      section
    );
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const mimicQuestions = async (title: string, questionIds: string) => {
  try {
    const data = await clientApi.put(`/api/tests/mimicQuestions`, {
      title: title,
      questionIds: questionIds,
    });
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const getPracticesetClassroom = async (practiceId: any) => {
  try {
    const data = await clientApi.get(`/api/tests//${practiceId}`);
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const updateClassroomList = async (testId: any, classes: any) => {
  try {
    const data = await clientApi.put(`/api/testSeries/${testId}/classrooms`, {
      classes,
    });
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const updatePractice = async (
  practiceId: any,
  practiceset: any,
  params: any = {}
) => {
  try {
    // delete practiceset.__v;
    const query = toQueryString(params);

    const data = await clientApi.put(
      `/api/tests/${practiceId}${query}`,
      practiceset
    );

    return data.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    alert("", error?.response?.data?.message);
  }
};

export const checkSectionQuestion = async (id?: any, params?: any) => {
  try {
    const query = toQueryString(params);

    const data = await clientApi.get(
      `/api/tests/checkSectionQuestion/${id}${params}`
    );
    return data.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};
export const destroy = async (practiceId: any, user: any) => {
  try {
    await clientApi.delete(`/api/tests/${practiceId}`);
    success("The assessment is removed successfully.");
    return "success";
  } catch (error) {
    if (user.role === "director") {
      alert(
        "",
        "You are not allowed to delete this assessment. Only publisher can remove this test."
      );
    } else {
      alert(
        "",
        "You are not allowed to delete this assessment. Only Director and creator of this assessment can delete it."
      );
    }
    console.error("Error fetching data:", error);
  }
};

export const getFeedbackRatingByAssessment = async (id: any, params: any) => {
  const query = id + toQueryString(params);
  try {
    const data = await clientApi.get(`/api/tests/feedbackRating/${query}}`);
    return data.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const getAvgRatingByAssessment = async (id: any, params: any) => {
  const query = id + toQueryString(params);
  try {
    const data = await clientApi.get(`/api/tests/avgRating/${query}}`);
    return data.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const findTeacherTests = async (params: any) => {
  const { data } = await clientApi.post(`/api/tests/teacher/find`, params);
  return data;
};

export const checkQuestions = async (testId: any) => {
  const { data } = await clientApi.get(
    `/api/tests/checkQuestionsBeforePublish/` + testId
  );
  return data;
};

export const findByExamId = async (params: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(`/api/tests/findByExamId${query}`);
  return data;
};

export const getByTestseries = async ($params: any) => {
  const query = toQueryString($params);
  const { data } = await clientApi.get(`/api/tests/getByTestseries${query}`);
  return data;
};

export const getAdaptiveLearningTest = async (params: any) => {
  try {
    const res = await clientApi.post(
      `/api/adaptiveTest/generateAdaptiveLearningTest/`,
      params
    );
    return res.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const generatePracticeSet = async (params: any) => {
  const { data } = await clientApi.post(
    `/api/adaptiveTest/generateAdaptiveTest/`,
    params
  );
  return data;
};

export const getAdaptiveQuestionTestCount = async (params: any) => {
  try {
    const res = await clientApi.post(
      `/api/adaptiveTest/checkAdaptiveTestQuestionCount/`,
      params
    );
    return res.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const endTestSession = async (testId: string) => {
  try {
    const res = await clientApi.get(`/api/tests/${testId}/end`);
    return res.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const findPracticeSets = async (params: any) => {
  try {
    const query = toQueryString(params);
    const res = await clientApi.get(
      `/api/tests/findPracticeSets/${params._id}${query}`
    );
    return res.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const getStudentTakingTest = async (testId: string, params: any) => {
  try {
    const query = toQueryString(params);
    const res = await clientApi.get(
      `/api/tests/${testId}/studentTakingTest${query}`
    );
    return res.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const getQuestionFeedback = async (params: any) => {
  try {
    const query = toQueryString(params);
    const res = await clientApi.get(
      `/api/tests/getQuestionFeedback/${params.qId}${query}`
    );
    return res.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const updateQuestionOrder = async (
  testId: string,
  question: any,
  newOrder: number
) => {
  try {
    const res = await clientApi.put(`/api/tests/${testId}/questionOrder`, {
      question: question,
      order: newOrder,
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const getLearningPracticeSet = async (testId: string, params?: any) => {
  try {
    const query = toQueryString(params);
    const res = await clientApi.get(
      `/api/learningTest/getPracticeSet/${testId}${query}`
    );
    return res.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const checkLastAttempt = async (testId: string, params?: any) => {
  try {
    const query = toQueryString(params);
    const res = await clientApi.get(
      `/api/learningTest/checkLastAttempt/${testId}${query}`
    );
    return res.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const listSubject = async (params?: any) => {
  const query = toQueryString(params);
  const session = await getSession();
  const { data } = await clientApi.get(
    `https://newapi.practiz.xyz/api/v1/subjects/getSubjectsInAllExams/${query}`,
    {
      headers: {
        instancekey: session?.instanceKey,
        Authorization: `bearer ${session?.accessToken}`,
      },
    }
  );
  return data;
};

export const findPublisher = async (params: any) => {
  try {
    const res = await clientApi.post(`/api/publishers`, params);
    return res.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const countAll = async (data: any) => {
  try {
    const res = await clientApi.post(`/api/tests/countPractice`, data, {
      headers: { "X-HTTP-Method-Override": "GET" },
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const findAll = async ($params: any, tags?: string) => {
  try {
    if (tags) {
      $params["tags"] = tags;
    }
    const res = await clientApi.post(`/api/tests/findAll`, $params);
    return res.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const getTestByTestCode = async (practiceId: string, $params?: any) => {
  try {
    const query = toQueryString($params);
    const { data } = await clientApi.get(
      `/api/tests/findTestByTestCode/${practiceId}${query}`
    );
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const findTeacherTestTags = async (params: any) => {
  try {
    const res = await clientApi.post(`/api/tests/teacher/findTags`, params);
    return res.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const findForMentor = async (params: any) => {
  try {
    const query = toQueryString(params);
    const res = await clientApi.get(
      `/api/tests/findForMentor/${params._id}${query}`
    );
    return res.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const countAllByMe = async (params: any) => {
  try {
    const res = await clientApi.post(`/api/tests/teacher/count`, params);
    return res.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const findByClassRoom = async (params: any) => {
  try {
    const query = toQueryString(params);
    const res = await clientApi.get(`/api/tests/findByClassRoom${query}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const findOne = async (practiceId: string) => {
  try {
    const res = await clientApi.get(`/api/tests/${practiceId}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const getPurchasedTests = async (params: any) => {
  try {
    const query = toQueryString(params);
    const res = await clientApi.get(`/api/tests/purchasedTests${query}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const getAttendants = async (testId: string, params: any) => {
  try {
    const query = toQueryString(params);
    const res = await clientApi.get(`/api/tests/${testId}/attendants/${query}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const startTestSession = async (testId: string) => {
  try {
    const res = await clientApi.get(`/api/tests/${testId}/start`);
    return res.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const updateAttendance = async (
  testId: string,
  studentId: string,
  admitted: boolean
) => {
  try {
    const toUpdate = {
      testId: testId,
      studentId: studentId,
      admitted: admitted,
    };
    const res = await clientApi.put(`/api/tests/attendance`, toUpdate);
    return res.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const resetIpRestriction = async (testId: string, studentId: string) => {
  try {
    const res = await clientApi.put(
      `/api/tests/${testId}/resetIpRestriction/${studentId}`,
      {}
    );
    return res.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const countAttendants = async (testId: string, params: any) => {
  try {
    let query = toQueryString(params);
    query += "&count=true";
    const res = await clientApi.get(`/api/tests/${testId}/attendants/${query}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const exportTest = async (params: any) => {
  try {
    const query = toQueryString(params);
    const res = await clientApi.get(
      `/api/tests/exportTest/${params.id}${query}`,
      { responseType: "blob" }
    );
    return res.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const showDetail = async (testId: string, $params: any) => {
  try {
    const query = toQueryString($params);
    const res = await clientApi.get(`/api/tests/${testId}${query}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const showTestDetail = async (testId: string, $params: any) => {
  try {
    const query = toQueryString($params);
    const res = await clientApi.get(`/api/tests/testDetails/${testId}${query}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const getTestPublicData = async (testId: string, $params: any) => {
  try {
    const query = toQueryString($params);
    const res = await clientApi.get(
      `/api/tests/findOneShared/${testId}${query}`
    );
    return res.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const getMaximumTestMarks = async (testId: string, $params?: any) => {
  try {
    const query = toQueryString($params);
    const res = await clientApi.get(
      `/api/tests/getMaximumTestMarks/${testId}${query}`
    );
    return res.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const getAdaptiveTest = async (testId: string) => {
  try {
    const res = await clientApi.get(
      `/api/adaptiveTest/getAdaptiveTest/${testId}`
    );
    return res.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const getProcessingDocm = async () => {
  try {
    const res = await clientApi.get(`/api/tests/processingDocm`);
    return res.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const getNextAdaptiveQuestion = async ($params: any) => {
  try {
    const res = await clientApi.post(
      `/api/adaptiveTest/getNextQuestion`,
      $params
    );
    return res.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const getFirstQuestion = async ($params: any) => {
  try {
    const query = toQueryString($params);
    const res = await clientApi.get(
      `/api/adaptiveTest/getFirstQuestion${query}`
    );
    return res.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const findOneWithQuestions = async (practiceId: string, params: any) => {
  try {
    const query = toQueryString(params);
    const res = await clientApi.get(
      `/api/tests/findOneWithQuestions/${practiceId}${query}`
    );
    return res.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const getSectionAdaptiveTest = async (parentTestId: string) => {
  try {
    const res = await clientApi.get(
      `/api/tests/getSectionAdaptiveTest/${parentTestId}`
    );
    return res.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const completedTestStudentsByClass = async (
  id: string,
  params?: any
) => {
  try {
    const query = toQueryString(params);
    const res = await clientApi.get(
      `/api/tests/completedTestStudentsByClass/${id}${query}`
    );
    return res.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const ongoingTestByClass = async (classId: string, params?: any) => {
  try {
    const query = toQueryString(params);
    const res = await clientApi.get(
      `/api/tests/ongoingTestByClass/${classId}${query}`
    );
    return res.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const upcomingTestByClass = async (params?: any) => {
  try {
    const query = toQueryString(params);
    const res = await clientApi.get(
      `/api/tests//tests/upcomingTestByClass/${params}`
    );
    return res.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const completedTestByClass = async (params: any) => {
  try {
    const res = await clientApi.get(
      `/api/tests/completedTestByClass/${params}`
    );
    return res.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const updateFunc = async (
  practiceId?: any,
  practiceset?: any,
  params?: any
) => {
  delete practiceset.__v;
  const query = toQueryString(params);
  const { data } = await clientApi.put(
    `/api/tests/${practiceId}${query}`,
    practiceset
  );
  return data;
};

export const getModuleTests = async (testId: string) => {
  const { data } = await clientApi.get(`/api/tests/${testId}/moduleTests`);
  return data;
};

export const findOneForSession = async (testId: any) => {
  const { data } = await clientApi.get(
    `/api/tests/findOneForSession/${testId}`
  );
  return data;
};

export const enrollTest = async (id: any, params?: any) => {
  const query = toQueryString(params);

  const { data } = await clientApi.get(`/api/tests/enroll/${id}${query}`);
  return data;
};

export const updatePreferences = async (testId: any, da: any) => {
  const session = await getSession();

  const { data } = await clientApi.put(
    `https://newapi.practiz.xyz/api/v1/tests/${testId}/preferences`,
    da,
    {
      headers: {
        instancekey: session?.instanceKey,
        Authorization: `bearer ${session?.accessToken}`,
      },
    }
  );
  return data;
};

export const getPublisherAssessments = async (params?: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(
    `/api/tests/getPublisherAssessments${query}`
  );
  return data;
};

export const getStudentPurchasedTests = async (params?: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(
    `/api/tests/studentPurchasedTests${query}`
  );
  return data;
};

export const recentTest = async (userId: any, params: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(
    `/api/tests/recentTests/${userId}${query}`
  );
  return data;
};

export const assignedTests = async (userId: any, params: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(
    `/api/tests/assignedTests/${userId}${query}`
  );
  return data;
};
