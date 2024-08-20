import { getData, postData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  return await postData("/institute/setDefault", {}, request);
}
