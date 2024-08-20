import { getData, putData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest, { params }: { params: any }) {
  const { classId } = params;
  return await getData(`/testSeries/getByClassroom/${classId}`, req);
}
