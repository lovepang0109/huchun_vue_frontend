import { getData, putData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest, { params }: { params: any }) {
  const { id } = params;
  return await getData(`/topics/${id}`, req);
}

export async function PUT(request: NextRequest, { params }: { params: any }) {
  const { id } = params;

  const para = await request.json();
  return await putData(`/topics/${id}`, para, request);
}
