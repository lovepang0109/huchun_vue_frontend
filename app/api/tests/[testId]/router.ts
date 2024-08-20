import { getData, putData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest, { params }: { params: any }) {
  const { testId } = params;
  return await getData(`/test/${testId}`, req);
}

export async function PUT(req: NextRequest, { params }: { params: any }) {
  const { testId } = params;
  return await putData(`/tests//${testId}`, await req.json(), req);
}
