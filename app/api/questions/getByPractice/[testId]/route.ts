import { getData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: { params: any }) {
  const { testId } = params;
  return await getData(`/questions/getByPractice/${testId}`, request);
}
