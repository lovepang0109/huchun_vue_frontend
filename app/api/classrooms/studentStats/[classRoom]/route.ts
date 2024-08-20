import { getData, getQueryString } from "@/lib/api";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: { params: any }) {
  const {classRoom} = params
  return await getData(
    `/classRooms/studentStats/${classRoom}`,
    request
  );
}
