import { putData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function PUT(request: NextRequest, { params }: { params: any }) {
  return await putData(`/users/marketingUtm/status`, await request.json(), request);
}