import { postData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {

  return await postData(
    `/questions/units`,
    await req.json(),
    req
  );
}
