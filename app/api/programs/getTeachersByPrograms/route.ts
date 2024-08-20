import { getData, getQueryString } from "@/lib/api";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  return await getData(`/programs/getTeachersByPrograms`, req);
}
