import { getData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest, { params }: { params: any }) {
  const { id, query } = params;
  return await getData(`/course/section/${id}/report/${query}`, req);
}
