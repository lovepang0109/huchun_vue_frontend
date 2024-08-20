import { putData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function PUT(request: NextRequest) {
  const data = await request.json()

  return await putData(`/users/${data.userId}/requestEmailCode`, {}, request);
}
