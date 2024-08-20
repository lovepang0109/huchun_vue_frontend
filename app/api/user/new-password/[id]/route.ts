import { putData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function PUT(
  request: NextRequest,
  {
    params,
  }: {
    params: { id: string };
  },
) {
  return putData(`/users/${params.id}/newPassword`, await request.json(), request)
}