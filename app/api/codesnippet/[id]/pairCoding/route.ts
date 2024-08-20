import { putData, getData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function PUT(request: NextRequest, { params }: { params: any }) {
  const { id } = params;

  return await putData(
    `/codesnippet/${id}/pairCoding`,
    await request.json(),
    request
  );
}

export async function GET(req: NextRequest, { params }: { params: any }) {
  const { id } = params;

  return await getData(`/codesnippet/${id}`, req);
}
