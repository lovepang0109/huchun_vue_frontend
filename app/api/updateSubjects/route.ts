import { putData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function PUT(req: NextRequest) {
  return putData(`/users/updateSubjects`, await req.json(), req)
}
