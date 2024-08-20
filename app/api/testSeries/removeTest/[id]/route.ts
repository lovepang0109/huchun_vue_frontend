import { getQueryString, putData } from "@/lib/api";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: any }) {
  const { id } = params;
  return await putData(`/testSeries/${id}/removeTest`, await req.json(), req);
}
