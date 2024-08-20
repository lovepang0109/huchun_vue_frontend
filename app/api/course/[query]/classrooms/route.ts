import { putData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: any }) {
  const { query } = params;
  const requrestData = await req.json();
  return await putData(`/course/${query}/classrooms`, requrestData, req);
}
