import { getData, postData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  return await getData(`/feedbacks/questionFeedback`, request);
}


export async function POST(request: NextRequest, { params }: { params: any }) {
  return await postData(`/feedbacks/questionFeedback`,await request.json(), request);
}

