import clientApi from "./clientApi";

export const runCodeForQuestion = async (
  questionId: any,
  code: any,
  inputs: any,
  type: any,
  practiceId: any,
  attemptDetailId?: any
) => {
  const codeToExec = {
    code: code,
    testcases: inputs,
  };
  let params: any = {
    type: type,
    testId: practiceId,
    questionId: questionId,
  };
  if (attemptDetailId) {
    params["attemptDetailId"] = attemptDetailId;
  }
  const { data } = await clientApi.post(
    "/api/questions/executeCode",
    { params, codeToExec },
    {
      headers: { "Content-Type": "text/plain" },
    }
  );
  return data;
};
