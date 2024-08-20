import { putData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function PUT(request: NextRequest, { params }: { params: any }) {
  const { questionId } = params;
  return await putData(
    `/feedbacks/markQuestionResolved/${questionId}`,
    await request.json(),
    request
  );
}
