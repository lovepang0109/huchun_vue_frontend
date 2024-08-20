import { useParams } from 'next/navigation';
import { getData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: { params: any }) {
  const { id } = params
  return await getData(`/course/getTeacherCourseDetails/${id}`, request)
}
