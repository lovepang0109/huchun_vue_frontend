import { getData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: { params: any }) {
  const { classroomId } = params;
  console.log(classroomId);
  return await getData(`/classRooms/leaderboard/${classroomId}`, request);
}
