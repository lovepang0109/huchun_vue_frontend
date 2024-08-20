import { putData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: any }) {
  const { courseId } = params;
  try {
    return await putData(
      `/course/publishSection/${courseId}`,
      await req.json(),
      req
    );
  } catch (error) {
    return error;
  }
}
