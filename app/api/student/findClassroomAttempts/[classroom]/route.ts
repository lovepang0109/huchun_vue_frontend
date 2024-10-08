import { getData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest, { params }: { params: any }) {
  const { classroom } = params;
  return await getData(`/student/findClassroomAttempts/${classroom}`, req);
}
