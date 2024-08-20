import { getData, getQueryString, postData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  console.log(getQueryString(request));
  return await getData("/classRooms/find", request);
}

export async function POST(request: NextRequest) {
  return await postData(
    `/classRooms`,
    await request.json(),
    request,
  )
}
