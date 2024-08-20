import { postData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  return await postData(
    `/adaptiveTest/generateAdaptiveTest`,
    await request.json(),
    request
  );
}
