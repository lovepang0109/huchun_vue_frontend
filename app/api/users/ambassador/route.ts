import { putData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function PUT(request: NextRequest, { params }: { params: any }) {
  return await putData(`/users/ambassador`, await request.json(), request);
}
