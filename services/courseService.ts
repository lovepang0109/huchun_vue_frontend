import clientApi from "@/lib/clientApi";
import { toQueryString } from "@/lib/validator";
import { getSession } from "next-auth/react";

interface CourseMsgEntry {
  notificationMsg: string;
  disableAccess: boolean;
}
export const getEnrolledCourses = async (id: any, q?: any) => {
  const query = toQueryString(q);
  const { data } = await clientApi.get(
    `/api/course/enrolledCourses/${id}${query}`
  );
  return data;
};

export const getCourses = async (params?: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(`/api/course${query}`);
  return data;
};
export const getUserCourseData = async (id: any, params?: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(`/api/course/${id}/userCourse${query}`);
  return data;
};

export const getCourseSubject = async (params?: any) => {
  const session = await getSession();

  const query = toQueryString(params);
  const { data } = await clientApi.get(
    `https://newapi.practiz.xyz/api/v1/course/subjects/me${query}`,
    {
      headers: {
        instancekey: session?.instanceKey,
        Authorization: `bearer ${session?.accessToken}`,
      },
    }
  );
  return data;
};

export const getMyFavorite = async (params?: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(`/api/course/favorite/me${query}`);
  return data;
};

export const getClassesTimeSpent = async (params?: string) => {
  const { data } = await clientApi.get(
    `/api/course/getClassesTimeSpent/${params}`
  );
  return data;
};

export const removeClassroom = async (courseId: string, itemId: string) => {
  const { data } = await clientApi.delete(
    `/api/course/removeClassroom/${courseId}/${itemId}`
  );
  return data;
};

export const create = async (course: any) => {
  const { data } = await clientApi.post(`/api/course`, course);
  return data;
};

export const withdraw = async (courseId: string, msg: CourseMsgEntry) => {
  const { data } = await clientApi.put(`/api/course/withdraw/${courseId}`, msg);
  return data;
};

export const update = async (id: string, crs: any) => {
  const { data } = await clientApi.put(`/api/course/${id}`, crs);
  return data;
};

export const Delete = async (id: string) => {
  const { data } = await clientApi.delete(`/api/course/${id}`);
  return data;
};

export const copy = async (courseId: string, copyData: any) => {
  const { data } = await clientApi.post(
    `/api/course/copy/${courseId}`,
    copyData
  );
  return data;
};

export const getStudentPerformance = async (
  id: string | string[],
  params?: any
) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(
    `/api/course/analytics/studentPerformance/${id}${query}`
  );
  return data;
};

export const getAvgRatingByCourse = async (
  id: string | string[],
  params: any
) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(`/api/course/avgRating/${id + query}`);
  return data;
};

export const getRatingByCourse = async (
  id: string | string[],
  params?: any
) => {
  const query = toQueryString(params);

  const { data } = await clientApi.get(`/api/course/ratings/${id + query}`);
  return data;
};

export const getOngoingClasses = async (param?: any) => {
  const { data } = await clientApi.get(
    `/api/course/getOngoingClasses/${param}`
  );
  return data;
};

export const getRatingCountByCourse = async (
  id: string | string[],
  params?: any
) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(
    `/api/course/ratingsCount/${id + query}`
  );
  return data;
};

export const getTeacherCourseDetails = async (param?: any) => {
  const { data } = await clientApi.get(
    `/api/course/getTeacherCourseDetails/${param}`
  );
  return data;
};

export const updateSectionsOrder = async (
  id: string | string[],
  sections: any
) => {
  const { data } = await clientApi.put(
    `/api/course/updateSectionOrder/` + id,
    sections
  );
  return data;
};

export const publishSection = async (courseId: string, section: any) => {
  try {
    const { data } = await clientApi.put(
      `/api/course/publishSection/${courseId}`,
      section
    );
    return data;
  } catch (error) {
    return error;
  }
};

export const getStudentEffortAnalytics = async (
  id: string | string[],
  params?: any
) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(
    `/api/course/analytics/studentEfforts/${id}${query}`
  );
  return data;
};

export const getLearningAndPracticeAnalytics = async (
  id: string | string[],
  params?: any
) => {
  const query = toQueryString(params);

  const { data } = await clientApi.get(
    `/api/course/analytics/learningAndPractice/${id}${query}`
  );
  return data;
};

export const getStudentProgressByChapter = async (
  id: string | string[],
  params?: any
) => {
  const query = toQueryString(params);

  const { data } = await clientApi.get(
    `/api/course/analytics/studentProgressByChapter/${id}${query}`
  );
  return data;
};

export const getInactiveStudents = async (
  id: string | string[],
  params?: any
) => {
  const query = toQueryString(params);

  const { data } = await clientApi.get(
    `/api/course/analytics/inactiveStudents/${id}${query}`
  );
  return data;
};

export const ignoreInactive = async (courseId: any, studentId: any) => {
  const { data } = await clientApi.put(
    "/api/course/ignoreInactive/" + courseId,
    {
      student: studentId,
    }
  );
  return data;
};

export const remindInactive = async (
  courseId: any,
  studentId: any,
  sendEmail: any
) => {
  const { data } = await clientApi.put(
    "/api/course/remindInactive/" + courseId,
    {
      student: studentId,
      sendEmail: sendEmail,
    }
  );
  return data;
};

export const addFavoriteContent = async (
  courseId: string,
  contentId: string
) => {
  const { data } = await clientApi.put(
    `/api/course/favorite/${courseId}/${contentId}`,
    {}
  );
  return data;
};

export const removeFavoriteContent = async (
  courseId: string,
  contentId: string
) => {
  const { data } = await clientApi.delete(
    `/api/course/favorite/${courseId}/${contentId}`
  );
  return data;
};

export const startContent = async (
  courseId: any,
  section: any,
  content: any
) => {
  const { data } = await clientApi.put(`/api/course/startContent/${courseId}`, {
    section,
    content,
  });
  return data;
};

export const completeContent = async (
  courseId: any,
  section: any,
  content: any,
  timeSpent: any
) => {
  const session = await getSession();

  const { data } = await clientApi.put(
    `https://newapi.practiz.xyz/api/v1/course/${courseId}/completeContent`,
    {
      section,
      content,
      timeSpent,
    },
    {
      headers: {
        instancekey: session?.instanceKey,
        Authorization: `bearer ${session?.accessToken}`,
      },
    }
  );

  return data;
};

export const editContentInSection = async (
  id: any,
  sectionId: any,
  section: any
) => {
  const { data } = await clientApi.post(
    "/api/course/editContentInSection/" + id + "/" + sectionId,
    section
  );
  return data;
};

export const addSection = async (id: any, section: any) => {
  const { data } = await clientApi.post(
    "/api/course/addSection/" + id,
    section
  );
  return data;
};

export const deleteContent = async (courseId: any, contentId: any) => {
  const { data } = await clientApi.delete(
    `/api/course/deleteContent/${courseId}/${contentId}`
  );
  return data;
};

export const updateCourseContent = async (courseId: any, content: any) => {
  const { data } = await clientApi.put(
    "/api/course/updateCourseContent/" + courseId,
    content
  );
  return data;
};

export const deleteSection = async (courseId: any, sectionId: any) => {
  const { data } = await clientApi.delete(
    `/api/course/deleteSection/${courseId}/${sectionId}`
  );
  return data;
};

export const getStudentReportOverview = async (
  id: any,
  studentId: any,
  params?: any
) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(
    `/api/course/overview/${id}/${studentId}${query}`
  );
  return data;
};

export const getCourseContentAttemptByStudent = async (
  id: any,
  studentId: any,
  params: any
) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(
    `/api/course/attempt/${id}/${studentId}${query}`
  );
  return data;
};

export const getCourseSectionsByStatus = async (
  id: any,
  studentId: any,
  params: any
) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(
    `/api/course/section/${id}/${studentId}${query}`
  );
  return data;
};

export const getSettings = async () => {
  const { data } = await clientApi.get("/api/settings");
  return data;
};

export const getCourseSectionsReport = async (
  id: any,
  studentId: any,
  params: any
) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(
    `/api/course/section/report/${id}/${studentId}${query}`
  );
  return data;
};

export const getClassroomCourse = async (id: any, params?: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(`/api/course/byClassroom/${id}${query}`);
  return data;
};

export const getAllTeacherCourses = async (q?: any) => {
  const query = toQueryString(q);
  const { data } = await clientApi.get(
    `/api/course/getAllTeacherCourses/${query}`
  );
  return data;
};

export const getPublisherCourse = async (q: any) => {
  const query = toQueryString(q);
  const { data } = await clientApi.get(
    `/api/course/getPublisherCourse/${query}`
  );
  return data;
};

export const removeFavorite = async (id: any) => {
  const { data } = await clientApi.delete(`/api/course/removefavorite/${id}`);
  return data;
};

export const addFavorite = async (id: any) => {
  const { data } = await clientApi.put(`/api/course/addfavorite/${id}`, {});
  return data;
};

export const getTeacherCourses = async (params: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(`/api/course/teacher/all${query}`);
  return data;
};

export const getMyCourses = async (params: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(`/api/course/teacher/myCourses${query}`);
  return data;
};

export const getMyArchivedCourses = async (params: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(
    `/api/course/teacher/myArchived${query}`
  );
  return data;
};

export const getBestSeller = async (params: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(
    `/api/course/teacher/bestseller/me${query}`
  );
  return data;
};

export const getMostPopularCourses = async (params: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(
    `/api/course/teacher/mostPopularCourses${query}`
  );
  return data;
};

export const getHighestPaidCourses = async (params: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(
    `/api/course/teacher/highestPaidCourses${query}`
  );
  return data;
};

export const updateClassroomList = async (courseId: any, classes: any) => {
  const { data } = await clientApi.put(`/api/course/${courseId}/classrooms`, {
    classes,
  });
  return data;
};

export const aiGenerate = async (course: any) => {
  const { data } = await clientApi.post(`/api/course/aiGenerate`, course);
  return data;
};
