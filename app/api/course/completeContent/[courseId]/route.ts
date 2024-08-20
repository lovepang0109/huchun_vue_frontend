import { putData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: any }) {
  const { courseId } = params;
  return await putData(
    `/course/${courseId}/completeContent`,
    await req.json(),
    req
  );
}
