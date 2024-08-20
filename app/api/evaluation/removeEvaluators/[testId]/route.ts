import { postData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest, { params }: { params: any }) {
  let req = await request.json();
  const { testId } = params;
  return await postData(`/evaluation/removeEvaluators/${testId}`, req, request);
}
