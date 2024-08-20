import { getData, putData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: { params: any }) {
  const {status} = params;
  return await getData(`/users/liveBoard/classrooms/${status}`, request);
}
