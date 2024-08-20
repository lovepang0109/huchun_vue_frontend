import { getData, putData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest, { params }: { params: any }) {
  const { query } = params;
  return await getData(`/institute/${query}`, req);
}

export async function PUT(request: NextRequest, { params }: { params: any }) {
  const { query } = params;

  return await putData(`/institute/${query}`, await request.json(), request);
}