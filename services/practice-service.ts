import clientApi from "@/lib/clientApi";
import { toQueryString } from "@/lib/validator";
import { alert, success, error, confirm } from "alertifyjs";
import { getSession } from "next-auth/react";
export const findOne = async (practiceId: any) => {
  try {
    const data = await clientApi.get(`/api/tests/${practiceId}`);
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const saveAs = async (id: string, da: any) => {
  try {
    const { data } = await clientApi.put(`/api/tests/saveAs/${id}`, da);
    success("Test created successfully.");
    return data;
  } catch (error: any) {
    console.error("Error fetching data:", error.response.data.error);
    if (error.response.data.error) {
      alert(
        "Warning",
        "Test already exists with same name. It may be inactive."
      );
    } else {
      alert(
        "Message",
        "Something went wrong. Please try again after some time."
      );
    }
  }
};

export const exportPDF = async (testId: string, hasAnswers: boolean) => {
  let url = `https://newapi.practiz.xyz/api/v1/tests/exportPDF/${testId}?directDownload=true`;
  if (hasAnswers) {
    url += "&hasAnswers=true";
  }
  const session = await getSession();

  try {
    const response = await clientApi.get(url, {
      responseType: "blob",
      headers: {
        instancekey: session?.instanceKey,
        Authorization: `bearer ${session?.accessToken}`,
      },
    });

    const fileName =
      response.headers["content-disposition"].split("filename=")[1];
    return { fileName: fileName, blob: response.data };
  } catch (error) {
    console.error("Error exporting PDF:", error);
    // Handle errors as needed
  }
};

export const exportTest = async (params: any) => {
  const query = toQueryString(params);
  const session = await getSession();

  clientApi
    .get(
      `https://newapi.practiz.xyz/api/v1/tests/exportTest/${params.id}${query}`,
      {
        responseType: "blob",
        headers: {
          instancekey: session?.instanceKey,
          Authorization: `bearer ${session?.accessToken}`,
        },
      }
    )
    .then((response) => {
      const fileName =
        response.headers["content-disposition"].split("filename=")[1];
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
    })
    .catch((error) => {
      console.error(error);
    });
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
    const data = await clientApi.get(
      `/api/tests/getPracticesetClassrooms/${practiceId}`
    );
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const updateClassroomList = async (testId: any, classes: any) => {
  const { data } = await clientApi.put(`/api/tests/${testId}/classrooms`, {
    classes,
  });
  return data;
};

export const updatePractice = async (
  practiceId?: any,
  practiceset?: any,
  params: any = {}
) => {
  delete practiceset.__v;
  const query = toQueryString(params);

  const session = await getSession();
  const { data } = await clientApi.put(
    `https://newapi.practiz.xyz/api/v1/tests/${practiceId}${query}`,
    practiceset,
    {
      headers: {
        instancekey: session?.instanceKey,
        Authorization: `bearer ${session?.accessToken}`,
      },
    }
  );

  return data;
};

export const checkSectionQuestion = async (id?: any, params?: any) => {
  try {
    const query = toQueryString(params);

    const data = await clientApi.get(
      `/api/tests/checkSectionQuestion/${id}${query}`
    );
    return data.data;
  } catch (err) {
    // console.log(err?.response?.data, "errororor")
    alert("Message", err?.response?.data);
  }
};

export const destroy = async (practiceId: any, user: any) => {
  try {
    await clientApi.delete(`/api/tests/${practiceId}`, {});
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

export const getQuestionList = async (testId: any) => {
  try {
    const data = await clientApi.get(`/api/tests/questionList/${testId}`);
    return data.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};
export const showDetail = async (testId: any, params?: any) => {
  const query = toQueryString(params);
  try {
    const { data } = await clientApi.get(`/api/tests/${testId}${query}`);
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const findOneWithQuestions = async (practiceId: any, params?: any) => {
  const query = toQueryString(params);
  try {
    const data = await clientApi.get(
      `/api/tests/findOneWithQuestions/${practiceId}${query}`
    );
    return data.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const updateAssessment = async (
  practiceId?: any,
  practiceset?: any,
  params?: any
) => {
  delete practiceset.__v;
  const query = toQueryString(params);
  try {
    const data = await clientApi.put(
      `/api/tests/${practiceId}${query}`,
      practiceset
    );
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const create = async (practiceset: any) => {
  const { data } = await clientApi.post(`/api/tests/`, practiceset);
  return data;
};

export const getPreferences = async (testId: any) => {
  const session = await getSession();

  const { data } = await clientApi.get(
    `https://newapi.practiz.xyz/api/v1/tests/${testId}/preferences`,
    {
      headers: {
        instancekey: session?.instanceKey,
        Authorization: `bearer ${session?.accessToken}`,
      },
    }
  );
  return data;
};

export const updateFunc = async (
  practiceId?: any,
  practiceset?: any,
  params?: any
) => {
  delete practiceset.__v;
  const query = toQueryString(params);
  const session = await getSession();
  const { data } = await clientApi.put(
    `https://newapi.practiz.xyz/api/v1/tests/${practiceId}${query}`,
    practiceset,
    {
      headers: {
        instancekey: session?.instanceKey,
        Authorization: `bearer ${session?.accessToken}`,
      },
    }
  );
  return data;
};
