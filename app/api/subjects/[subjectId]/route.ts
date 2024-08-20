import { getData, putData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest, { params }: { params: any }) {
  const { subjectId } = params;
  return await getData(`/subjects/${subjectId}`, req);
}

export async function PUT(request: NextRequest, { params }: { params: any }) {
  const { subjectId } = params;
  let req = await request.json();
  return await putData(`/subjects/${subjectId}`, req, request);
}
