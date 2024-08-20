import { getData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest, { params }: { params: any }) {
  const { courseId } = params;
  return await getData(`/course/verifyCourseUserProgress/${courseId}`, req);
}
