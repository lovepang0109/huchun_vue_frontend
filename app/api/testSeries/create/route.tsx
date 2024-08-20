import { postData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  let data = await req.json();
  return await postData(`/testSeries/`, data, req);
}
