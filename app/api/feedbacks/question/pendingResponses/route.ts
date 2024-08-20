import { getData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  return await getData(`/feedbacks/question/pendingResponses`, request);
}
