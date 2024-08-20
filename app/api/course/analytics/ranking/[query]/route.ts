import { getData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest, { params }: { params: any }) {
  const { query } = params;
  return await getData(`/course/analytics/ranking/${query}`, req);
}