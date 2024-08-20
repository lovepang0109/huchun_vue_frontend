import { putData, getData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function PUT(request: NextRequest, { params }: { params: any }) {
  const { userId } = params;
  return await putData(`/users/${userId}`, await request.json(), request);
}

export async function GET(request: NextRequest, { params }: { params: any }) {
  const { userId } = params;
  return await getData(`/users/${userId}`,  request);
}
