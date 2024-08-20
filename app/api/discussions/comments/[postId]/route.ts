import { getData, getQueryString } from "@/lib/api";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest, { params }: { params: any }) {
  const { postId } = params;
  const que = getQueryString(req);
  // console.log(que, "query>>>>>>")
  return await getData(`/discussions/${postId}/comments${que}`, req);
}
