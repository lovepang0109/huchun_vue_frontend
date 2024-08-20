import { getData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: { params: any }) {
  const { practiceSetId } = params;
  return await getData(`/feedbacks/getTopFeedbacks/${practiceSetId}`, request);
}