import { putData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function PUT(request: NextRequest, { params }: { params: any }) {
  const { id } = params;
  let req = await request.json();
  return await putData(`/subjects/updateStatus/${id}`, req, request);
}
