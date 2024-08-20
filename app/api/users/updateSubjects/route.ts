import { putData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function PUT(request: NextRequest) {
  let req = await request.json();
  return await putData(`/users/updateSubjects`, req, request);
}
