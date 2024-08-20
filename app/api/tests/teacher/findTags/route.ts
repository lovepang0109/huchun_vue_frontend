import { postData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  return await postData("/tests/teacher/findTags", await req.json(), req);
}
