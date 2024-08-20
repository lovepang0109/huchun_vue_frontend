import { postData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest, { params }: { params: any }) {
  const { qId } = params;
  return await postData(`/questions/${qId}/classboard`, await req.json(), req);
}
