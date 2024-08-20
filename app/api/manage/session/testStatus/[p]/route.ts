import { getData, getQueryString } from "@/lib/api";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: { params: any }) {
  const { p } = params;

  return await getData(`/manage/session/testStatus/${p}`, request);
}
