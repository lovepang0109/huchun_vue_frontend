import { putData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function PUT(request: NextRequest, { params }: { params: any }) {
  const { userId } = params;
  return await putData(
    `/users/updateStatus/${userId}`,
    await request.json(),
    request
  );
}
