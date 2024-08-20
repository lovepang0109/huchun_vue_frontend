import { getData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: { params: any }) {
  const { userId } = params;
  return await getData(`/users/link-preview/${userId}`, request);
}
