import { postData, getData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest, { params }: { params: any }) {
  let data = await request.json();
  data.emails = [data.emails];
  return await postData(`/users/inviteToJoin`, data, request);
}

export async function GET(req: NextRequest) {
  return await getData(`/users/inviteToJoin`, req);
}