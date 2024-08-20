import { putData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function PUT(request: NextRequest) {
  return await putData(`/users/addSubjects`, await request.json(), request);
}
