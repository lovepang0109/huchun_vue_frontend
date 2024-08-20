import { putData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function PUT(request: NextRequest, { params }: { params: any }) {
  return await putData(`/users/unsubscribe`, await request.json(), request);
}
