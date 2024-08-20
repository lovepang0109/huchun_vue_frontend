import { postData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const params = await req.json();
  return await postData("/tests/teacher/find", params, req);
}
