import { getData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest, { params }: { params: any }) {
  const { testId } = params;
  return await getData(`/evaluation/studentsByTest/${testId}}`, req);
}
