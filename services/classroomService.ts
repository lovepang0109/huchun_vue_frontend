import clientApi from "@/lib/clientApi";
import { toQueryString } from "@/lib/validator";
import { getSession } from "next-auth/react";

export const destroy = async (classRoomId: any) => {
  const session = await getSession();

  await clientApi.delete(
    `https://newapi.practiz.xyz/api/v1/classrooms/${classRoomId}`,
    {
      headers: {
        instancekey: session?.instanceKey,
        Authorization: `bearer ${session?.accessToken}`,
      },
    }
  );
};

export const findById = async (classRoom: any, params: any) => {
  const session = await getSession();

  const { data } = await clientApi.get(
    `https://newapi.practiz.xyz/api/v1/classRooms/findById/${classRoom}${toQueryString(
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

export const checkExits = async (params: any) => {
  const session = await getSession();

  const { data } = await clientApi.get(
    `https://newapi.practiz.xyz/api/v1/classRooms/me/findOne${toQueryString(
      params
    )},`,
    {
      headers: {
        instancekey: session?.instanceKey,
        Authorization: `bearer ${session?.accessToken}`,
      },
    }
  );
  return data;
};

export const getStudents = async (id, params) => {
  const { data } = await clientApi.get(
    `api/classRooms/${id}/students${toQueryString(params)}`
  );
  return data;
};

export const getAllInstitutes = async (query?: any) => {
  const { data } = await clientApi.get(
    `/api/institute/getAllInstitutes${toQueryString(query)}`
  );
  return data;
};
export const getClassRoomByLocation = async (
  locationsIds: any,
  params?: any
) => {
  if (!params) {
    params = {};
  }
  const p = { ...params, locationsIds: locationsIds };
  const { data } = await clientApi.get(
    `/api/classrooms/getClassRoomByLocation${toQueryString(p)}`
  );
  return data;
};
export const findMeOne = async (classRoom: any, params: any) => {
  const { data } = await clientApi.get(
    `/api/classrooms/me/findOne/${classRoom}${toQueryString(params)}`
  );
  return data;
};

export const create = async (classroom: any) => {
  const session = await getSession();

  const { data } = await clientApi.post(
    "https://newapi.practiz.xyz/api/v1/classRooms",
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

export const update = async (classRoom: any, dataUpdate: any) => {
  const session = await getSession();

  const { data } = await clientApi.put(
    `https://newapi.practiz.xyz/api/v1/classrooms/${classRoom}`,
    dataUpdate,
    {
      headers: {
        instancekey: session?.instanceKey,
        Authorization: `bearer ${session?.accessToken}`,
      },
    }
  );
  return data;
};

export const saveAs = async (id: any, classroom: any) => {
  const session = await getSession();

  const { data } = await clientApi.put(
    `https://newapi.practiz.xyz/api/v1/classrooms/saveAs/${id}`,
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

export const find = async (params?: any) => {
  const session = await getSession();

  const { data } = await clientApi.get(
    `https://newapi.practiz.xyz/api/v1/classrooms/find${toQueryString(params)}`,
    {
      headers: {
        instancekey: session?.instanceKey,
        Authorization: `bearer ${session?.accessToken}`,
      },
    }
  );
  return data;
};

export const updateStreamingStatus = async (
  classRoomId: number,
  stream: any
) => {
  const streamVal = {
    stream: stream,
  };
  const { data } = await clientApi.put(`/api/users/${classRoomId}`, streamVal);
  return data;
};

export const findMentorClassroom = async () => {
  const { data } = await clientApi.get("/api/classrooms/findMentorClassroom");
  return data;
};

export const leaderboard = async (id: any, params: any) => {
  const session = await getSession();

  const { data } = await clientApi.get(
    `https://newapi.practiz.xyz/api/v1/classRooms/leaderboard/${id}${toQueryString(
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

export const findStudents = async (params: any) => {
  const { data } = await clientApi.get(
    `/api/classrooms/findStudents${toQueryString(params)}`
  );
  return data;
};

export const findClassroomStudents = async (id: any, params: any) => {
  const { data } = await clientApi.get(
    `/api/classrooms/findClassroomStudents/${id}${toQueryString(params)}`
  );
  return data;
};

export const countStudents = async (params: any) => {
  const { data } = await clientApi.get(
    `/api/classrooms/countStudents${toQueryString(params)}`
  );
  return data;
};

export const findTeachers = async (id: any, params: any) => {
  const { data } = await clientApi.get(
    `/api/classrooms/findTeachers/${id}${toQueryString(params)}`
  );
  return data;
};

// ... (continue with the remaining methods)

export const regenerateCode = async (classId: any) => {
  const session = await getSession();

  const { data } = await clientApi.get(
    `https://newapi.practiz.xyz/api/v1/classRooms/${classId}/regenerateCode`,
    {
      headers: {
        instancekey: session?.instanceKey,
        Authorization: `bearer ${session?.accessToken}`,
      },
    }
  );
  return data;
};

export const subjectAccuracyAndSpeed = async (classId: any, params?: any) => {
  const session = await getSession();

  const { data } = await clientApi.get(
    `https://newapi.practiz.xyz/api/v1/classRooms/subjectAccuracyAndSpeed/${classId}${toQueryString(
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

export const studentStats = async (classRoom: any, params?: any) => {
  const session = await getSession();

  const query = toQueryString(params);
  const { data } = await clientApi.get(
    `https://newapi.practiz.xyz/api/v1/classRooms/studentStats/${classRoom}${query}`,
    {
      headers: {
        instancekey: session?.instanceKey,
        Authorization: `bearer ${session?.accessToken}`,
      },
    }
  );
  return data;
};

export const joinSession = async (classRoomId: string) => {
  const session = await getSession();

  const { data } = await clientApi.get(
    `https://newapi.practiz.xyz/api/v1/classRooms/joinSession/${classRoom}`,
    {
      headers: {
        instancekey: session?.instanceKey,
        Authorization: `bearer ${session?.accessToken}`,
      },
    }
  );
  return data;
};

export const startWbSession = async (info: any) => {
  const session = await getSession();

  const { data } = await clientApi.post(
    `https://newapi.practiz.xyz/api/v1/classRooms/startWbSession`,
    info,
    {
      headers: {
        instancekey: session?.instanceKey,
        Authorization: `bearer ${session?.accessToken}`,
      },
    }
  );
  return data;
};

export const getClassroomStudents = async (id: any, params?: any) => {
  const session = await getSession();

  const query = toQueryString(params);
  const { data } = await clientApi.get(
    `https://newapi.practiz.xyz/api/v1/classRooms/getClassroomStudents/${
      id + query
    }`,
    {
      headers: {
        instancekey: session?.instanceKey,
        Authorization: `bearer ${session?.accessToken}`,
      },
    }
  );
  return data;
};

export const getAllStudents = async (id: any, params?: any) => {
  const query = toQueryString(params);
  const session = await getSession();
  const { data } = await clientApi.get(
    `https://newapi.practiz.xyz/api/v1/classRooms/getAllStudents/${id + query}`,
    {
      headers: {
        instancekey: session?.instanceKey,
        Authorization: `bearer ${session?.accessToken}`,
      },
    }
  );
  return data;
};

export const remindStudent = async (classId: any, userId: any) => {
  const { data } = await clientApi.post(
    `/api/classRooms/${classId}/remindStudent`,
    { studentUserId: userId }
  );
  return data;
};

export const addTestToClassroom = async (classId: string, testId: string) => {
  const session = await getSession();
  const { data } = await clientApi.put(
    `https://newapi.practiz.xyz/api/v1/classRooms/${classId}/addTest/${testId}`,
    {},
    {
      headers: {
        instancekey: session?.instanceKey,
        Authorization: `bearer ${session?.accessToken}`,
      },
    }
  );
};

export const removeTestFromClassroom = async (
  classId: string,
  testId: string
) => {
  const session = await getSession();

  const { data } = await clientApi.delete(
    `https://newapi.practiz.xyz/api/v1/classRooms/${classId}/removeTest/${testId}`,
    {
      headers: {
        instancekey: session?.instanceKey,
        Authorization: `bearer ${session?.accessToken}`,
      },
    }
  );
  return data;
};

export const summaryAttemptedAllClassrooms = async (query: any) => {
  const session = await getSession();

  const { data } = await clientApi.get(
    `https://newapi.practiz.xyz/api/v1/classRooms/summaryAttemptedAllClassrooms${toQueryString(
      query
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

export const findAllClassroomsMe = async (query: any) => {
  const session = await getSession();

  const { data } = await clientApi.get(
    `https://newapi.practiz.xyz/api/v1/classRooms/findAllClassroomsMe${toQueryString(
      query
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

export const summaryCorrectClassroom = async (query: any) => {
  const session = await getSession();

  const { data } = await clientApi.get(
    `https://newapi.practiz.xyz/api/v1/classRooms/summaryCorrect${toQueryString(
      query
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

export const attemptTrend = async (classId: string, query?: any) => {
  const session = await getSession();
  const { data } = await clientApi.get(
    `https://newapi.practiz.xyz/api/v1/classRooms/attemptTrend/${classId}${toQueryString(
      query
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

export const addTestseriesToClassroom = async (
  classId: string,
  testseriesId: string
) => {
  const session = await getSession();
  const { data } = await clientApi.put(
    `https://newapi.practiz.xyz/api/v1/classRooms/${classId}/addTestseries/${testseriesId}`,
    {},
    {
      headers: {
        instancekey: session?.instanceKey,
        Authorization: `bearer ${session?.accessToken}`,
      },
    }
  );

  return data;
};

export const removeTestseriesFromClassroom = async (
  classId: string,
  testseriesId: string
) => {
  const session = await getSession();

  const { data } = await clientApi.delete(
    `https://newapi.practiz.xyz/api/v1/classRooms/${classId}/removeTestseries/${testseriesId}`,
    {
      headers: {
        instancekey: session?.instanceKey,
        Authorization: `bearer ${session?.accessToken}`,
      },
    }
  );
  return data;
};

export const getTeacherAssignments = async (id: string, params: any) => {
  const query = toQueryString(params);
  const session = await getSession();

  const { data } = await clientApi.get(
    `https://newapi.practiz.xyz/api/v1/classRooms/getTeacherAssignments/${id}${query}`,
    {
      headers: {
        instancekey: session?.instanceKey,
        Authorization: `bearer ${session?.accessToken}`,
      },
    }
  );
  return data;
};

export const updateTeacherAssignmentsStatus = async (params: any) => {
  const session = await getSession();

  const { data } = await clientApi.put(
    `https://newapi.practiz.xyz/api/v1/classRooms/updateTeacherAssignmentsStatus/`,
    params,
    {
      headers: {
        instancekey: session?.instanceKey,
        Authorization: `bearer ${session?.accessToken}`,
      },
    }
  );
  return data;
};

export const deleteTeacherAssignment = async (params: any, body: any) => {
  const session = await getSession();

  const { data } = await clientApi.delete(
    `https://newapi.practiz.xyz/api/v1/classRooms/deleteTeacherAssignment/${params}/${body}`,
    {
      headers: {
        instancekey: session?.instanceKey,
        Authorization: `bearer ${session?.accessToken}`,
      },
    }
  );
  return data;
};

export const getAssignmentById = async (params: any) => {
  const session = await getSession();
  const query = toQueryString(params);
  const { data } = await clientApi.get(
    `https://newapi.practiz.xyz/api/v1/classRooms/getAssignmentById${query}`,
    {
      headers: {
        instancekey: session?.instanceKey,
        Authorization: `bearer ${session?.accessToken}`,
      },
    }
  );
  return data;
};

export const createAssignment = async (id: string, params: any) => {
  const session = await getSession();
  const { data } = await clientApi.post(
    `https://newapi.practiz.xyz/api/v1/classRooms/createAssignment/${id}`,
    params,
    {
      headers: {
        instancekey: session?.instanceKey,
        Authorization: `bearer ${session?.accessToken}`,
      },
    }
  );
  return data;
};

export const editTeacherAssignment = async (params: any, q: any) => {
  const session = await getSession();
  const { data } = await clientApi.put(
    `https://newapi.practiz.xyz/api/v1/classRooms/editTeacherAssignment/${params.classroom}/${params.assignment}`,
    q,
    {
      headers: {
        instancekey: session?.instanceKey,
        Authorization: `bearer ${session?.accessToken}`,
      },
    }
  );
  return data;
};

export const getAllAssignments = async (id: any) => {
  const session = await getSession();
  const { data } = await clientApi.get(
    `https://newapi.practiz.xyz/api/v1/classRooms/getAllAssignments/${id}`,

    {
      headers: {
        instancekey: session?.instanceKey,
        Authorization: `bearer ${session?.accessToken}`,
      },
    }
  );
  return data;
};

export const getAllAssignmentByCount = async (params: any) => {
  const query = toQueryString(params);
  const session = await getSession();
  const { data } = await clientApi.get(
    `https://newapi.practiz.xyz/api/v1/classRooms/getAllAssignmentByCount${query}`,

    {
      headers: {
        instancekey: session?.instanceKey,
        Authorization: `bearer ${session?.accessToken}`,
      },
    }
  );
  return data;
};

export const getUserAssignment = async (params: any) => {
  const query = toQueryString(params);
  const session = await getSession();
  const { data } = await clientApi.get(
    `https://newapi.practiz.xyz/api/v1/classRooms/getUserAssignment${query}`,

    {
      headers: {
        instancekey: session?.instanceKey,
        Authorization: `bearer ${session?.accessToken}`,
      },
    }
  );
  return data;
};

export const assignAssignmentMarks = async (params: any) => {
  const session = await getSession();
  const { data } = await clientApi.put(
    `https://newapi.practiz.xyz/api/v1/classRooms/assignAssignmentMarks`,
    params,

    {
      headers: {
        instancekey: session?.instanceKey,
        Authorization: `bearer ${session?.accessToken}`,
      },
    }
  );
  return data;
};

export const getFilesByClassroom = async (id: any) => {
  const session = await getSession();
  const { data } = await clientApi.get(
    `https://newapi.practiz.xyz/api/v1/classRooms/files/${id}`,

    {
      headers: {
        instancekey: session?.instanceKey,
        Authorization: `bearer ${session?.accessToken}`,
      },
    }
  );
  return data;
};

export const addFolderItem = async (params: any) => {
  const session = await getSession();
  const { data } = await clientApi.put(
    `https://newapi.practiz.xyz/api/v1/classRooms/addFolderItem`,
    params,
    {
      headers: {
        instancekey: session?.instanceKey,
        Authorization: `bearer ${session?.accessToken}`,
      },
    }
  );
  return data;
};

export const deleteFolderItem = async (classId: any, folderId: any) => {
  const session = await getSession();
  const { data } = await clientApi.delete(
    `https://newapi.practiz.xyz/api/v1/classRooms/${classId}/removeFolder/${folderId}`,
    {
      headers: {
        instancekey: session?.instanceKey,
        Authorization: `bearer ${session?.accessToken}`,
      },
    }
  );
  return data;
};

export const getAllUserAssignment = async (id: any) => {
  const session = await getSession();
  const { data } = await clientApi.get(
    `https://newapi.practiz.xyz/api/v1/classRooms/getAllUserAssignment/${id}`,

    {
      headers: {
        instancekey: session?.instanceKey,
        Authorization: `bearer ${session?.accessToken}`,
      },
    }
  );
  return data;
};

export const removeCourseFromClassroom = async (classId, courseId) => {
  const session = await getSession();
  const { data } = await clientApi.delete(
    `https://newapi.practiz.xyz/api/v1/classRooms//${classId}/removeCourse/${courseId}`,

    {
      headers: {
        instancekey: session?.instanceKey,
        Authorization: `bearer ${session?.accessToken}`,
      },
    }
  );
  return data;
};
