import clientApi from "@/lib/clientApi";
import { toQueryString } from "@/lib/validator";
import { getSession } from "next-auth/react";
import * as alertify from "alertifyjs";

export const getReports = async (params: any) => {
  const query = toQueryString(params);
  const session = await getSession();
  const { data } = await clientApi.get(
    `https://newapi.practiz.xyz/api/v1/admin/reports/${query}`,
    {
      headers: {
        instancekey: session?.instanceKey,
        Authorization: `bearer ${session?.accessToken}`,
      },
    }
  );
  return data;
};

export const getReport = async (id: string) => {
  const session = await getSession();

  const { data } = await clientApi.get(
    `https://newapi.practiz.xyz/api/v1/admin/reports/${id}`,
    {
      headers: {
        instancekey: session?.instanceKey,
        Authorization: `bearer ${session?.accessToken}`,
      },
    }
  );
  return data;
};

export const getPowerBIEmbeded = async (id: number, params: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(`/admin/powerBIEmbeded/${id}${query}`);
  return data;
};

export const getReportLink = async (id: number, params: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(`/admin/downloadReport/${id}${query}`);
  return data;
};

export const programOutcome = async (params?: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(`/admin/program-outcomes${query}`);
  return data;
};

export const createProgramOutcome = async (params: any) => {
  const { data } = await clientApi.post("/admin/program-outcome", params);
  return data;
};

export const updateProgramOutcome = async (params: any) => {
  const { data } = await clientApi.put(
    `/admin/program-outcome/${params._id}`,
    params
  );
  return data;
};

export const deleteProgramOutcome = async (params: any) => {
  const query = toQueryString(params);
  await clientApi.delete(`/admin/program-outcome/${params._id}${query}`);
};

export const accreditationEvaluations = async (params?: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(
    `/admin/accreditation/evaluations${query}`
  );
  return data;
};

export const createAccreditationEvaluation = async (params: any) => {
  const { data } = await clientApi.post(
    "/admin/accreditation/evaluation",
    params
  );
  return data;
};

export const updateAccreditationEvaluation = async (params: any) => {
  const { data } = await clientApi.put(
    `/admin/accreditation/evaluation/${params._id}`,
    params
  );
  return data;
};

export const deleteAccreditationEvaluation = async (params: any) => {
  const query = toQueryString(params);
  await clientApi.delete(
    `/admin/accreditation/evaluation/${params._id}${query}`
  );
};

export const accreditationCourses = async (params?: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(`/admin/accreditation/courses${query}`);
  return data;
};

export const createAccreditationCourse = async (params: any) => {
  const { data } = await clientApi.post("/admin/accreditation/course", params);
  return data;
};

export const updateAccreditationCourse = async (params: any) => {
  const { data } = await clientApi.put(
    `/admin/accreditation/course/${params._id}`,
    params
  );
  return data;
};

export const getAccreditationSetting = async (params?: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(`/admin/accreditation/settings${query}`);
  return data;
};

export const updateAccreditationSetting = async (params: any) => {
  const { data } = await clientApi.put(
    `/admin/accreditation/setting/${params.slug}`,
    params
  );
  return data;
};

export const deleteAccreditationCourse = async (params: any) => {
  const query = toQueryString(params);
  await clientApi.delete(`/admin/accreditation/course/${params._id}${query}`);
};

export const getAttainments = async (code: any) => {
  const { data } = await clientApi.get(
    `/admin/accreditation/accreditationattainment/${code}`
  );
  return data;
};

export const getAccreditationReports = async () => {
  const { data } = await clientApi.get("/admin/accreditation/reports");
  return data;
};

export const levelUp = async (params: any) => {
  const { data } = await clientApi.put(
    `/admin/level-upgrade/${params._id}`,
    params
  );
  return data;
};

export const levelDown = async (params: any) => {
  const { data } = await clientApi.put(
    `/admin/level-downgrade/${params._id}`,
    params
  );
  return data;
};

export const downloadPsychoReport = async (testId: any, params: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(
    `/admin/downloadPsychoReport/${testId}${query}`
  );
  return data;
};

export const uploadUser = async (formData: any) => {
  const session = await getSession();

  const { data } = await clientApi.post(
    "https://newapi.practiz.xyz/api/v1/classRooms/importStudentAdmin",
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

export const uploadMentor = async (formData: any) => {
  const { data } = await clientApi.post(
    "/classRooms/importMentorMentees",
    formData
  );
  return data;
};

export const uploadAssessmentClassroomMap = async (formData: any) => {
  const session = await getSession();

  const { data } = await clientApi.post(
    "https://newapi.practiz.xyz/api/v1/admin/mapTestToClassroom",
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

export const getMailTemplates = async (params?: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(`/api/admin/mailTemplates${query}`);
  return data;
};

export const sendBulkMail = async (template: any) => {
  const { data } = await clientApi.post("/api/admin/sendBulkMail", template);
  return data;
};

export const updateMailTemplate = async (id: any, template: any) => {
  const { data } = await clientApi.put(
    `/api/admin/updateMailTemplate/${id}`,
    template
  );
  return data;
};

export const testBulkMail = async (id: any, template: any) => {
  const { data } = await clientApi.post(
    `/api/admin/testBulkMail/${id}`,
    template
  );
  return data;
};

export const testMailByKey = async (key: any, data: any) => {
  const { data: responseData } = await clientApi.post(
    `/api/admin/testMailByKey/${key}`,
    data
  );
  return responseData;
};

export const sendRemindProctoredTestMail = async (
  classId: any,
  testData: any
) => {
  const { data } = await clientApi.post(
    `/api/admin/sendRemindProctoredTestMail/${classId}`,
    testData
  );
  return data;
};

export const runMailTemplateDataSource = async (
  dataCollection: any,
  dataSource: any,
  params: any
) => {
  const query = toQueryString(params);
  const { data } = await clientApi.post(
    `/api/admin/runBulkMailDataSource${query}`,
    { dataCollection, dataSource }
  );
  return data;
};

export const uploadCampaignMailSource = async (templateId: any, form: any) => {
  const session = await getSession();

  const { data } = await clientApi.post(
    `https://newapi.practiz.xyz/api/v1/admin/uploadCampaignMailSource/${templateId}`,
    form,
    {
      headers: {
        instancekey: session?.instanceKey,
        Authorization: `bearer ${session?.accessToken}`,
      },
    }
  );
  return data;
};

export const removeCampaignMailUploadedSource = async (templateId: any) => {
  await clientApi.delete(
    `/api/admin/removeCampaignMailUploadedSource/${templateId}`
  );
};

export const getNews = async (params?: any) => {
  const query = toQueryString(params);
  const { data } = await clientApi.get(`/api/admin/news${query}`);
  return data;
};

export const createNews = async (newsData: any) => {
  const { data } = await clientApi.post("/api/admin/news", newsData);
  return data;
};

export const updateNews = async (id: any, newsData: any) => {
  const { data } = await clientApi.put(`/api/admin/news/${id}`, newsData);
  return data;
};

export const getReportData = async (api: any, params: any) => {
  const query = toQueryString(params);
  const session = await getSession();

  const { data } = await clientApi.get(
    `https://newapi.practiz.xyz/api/v1/admin/reportData/${api}${query}`,
    {
      headers: {
        instancekey: session?.instanceKey,
        Authorization: `bearer ${session?.accessToken}`,
      },
    }
  );
  return data;
};

export const downloadReportData = async (api: any, params: any) => {
  const query = toQueryString(params);
  const session = await getSession();
  clientApi
    .get(`https://newapi.practiz.xyz/api/v1/admin/reportData/${api}${query}`, {
      responseType: "blob",
      headers: {
        instancekey: session?.instanceKey,
        Authorization: `bearer ${session?.accessToken}`,
      },
    })
    .then((response) => {
      // console.log(response, "res");
      // const fileName =
      //   response.headers["content-disposition"].split("filename=")[1];
      // const url = window.URL.createObjectURL(new Blob([response.data]));
      // const link = document.createElement("a");
      // link.href = url;
      // link.setAttribute("download", fileName);
      // document.body.appendChild(link);
      // link.click();
    })
    .catch((error) => {
      console.error("Error downloading report data:", error);
      alertify.alert(
        "Message",
        "An error occurred while processing your request."
      );
    });
};

export const changeMailTemlateStatus = async (id: any, status: any) => {
  const { data } = await clientApi.put(`/api/admin/mailTemplate/${id}/status`, {
    status,
  });
  return data;
};
