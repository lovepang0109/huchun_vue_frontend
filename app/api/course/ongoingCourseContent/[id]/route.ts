import { getData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest, { params }: { params: any }) {
  const { id } = params;
  return await getData(`/course/ongoingCourseContent/${id}`, req);
}
