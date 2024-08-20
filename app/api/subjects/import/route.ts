import { postData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const para = await request.json();
  return await postData(`/subjects/import`, para, request);
}
