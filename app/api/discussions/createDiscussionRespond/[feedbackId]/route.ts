import { postData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest, { params }: { params: any }) {
  const { feedbackId } = params;
  return await postData(
    `/discussions/createDiscussionRespond/${feedbackId}`,
    await req.json(),
    req
  );
}
