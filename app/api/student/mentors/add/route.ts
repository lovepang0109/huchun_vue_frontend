import { putData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  return await putData(
    `/institute//student/mentors/findOne`,
    await req.json(),
    req
  );
}
