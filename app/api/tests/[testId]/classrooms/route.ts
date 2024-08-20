import { putData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function PUT(request: NextRequest, { params }: { params: any }) {
  const { testId } = params;
  return await putData(
    `/tests/${testId}/classrooms`,
    await request.json(),
    request
  );
}
