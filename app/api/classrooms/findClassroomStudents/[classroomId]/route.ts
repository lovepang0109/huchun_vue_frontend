import { getData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: { params: any }) {
  const { classroomId } = params;
  return await getData(
    `/classRooms/findClassroomStudents/${classroomId}`,
    request
  );
}
