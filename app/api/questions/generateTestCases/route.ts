import { postData } from "@/lib/api";
import { toQueryString } from "@/lib/validator";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  // const { codeToExec, params } = await req.json();

  return await postData(`/questions/generateTestCases`, await req.json(), req);
}
