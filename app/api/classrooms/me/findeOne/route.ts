import { getData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: { params: any }) {

  return await getData(`/classrooms/me/findOne`, request);
}
