import { postData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const que = await req.json()
  return await postData(`/institute/join`, que, req);
}
