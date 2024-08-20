import { getData, getQueryString } from "@/lib/api";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: { params: any }) {
  const { id } = params;

  return await getData(`/manage/session/getSessionById/${id}`, request);
}
