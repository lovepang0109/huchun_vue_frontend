import { putData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: any }) {
  const { p } = params;
  try {
    return await putData(
      `/manage/session/updateStudentStatus/${p}`,
      await req.json(),
      req
    );
  } catch (error) {
    return error;
  }
}
