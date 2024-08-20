import { putData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: any }) {
  const { id } = params;
  return await putData(`/testSeries/${id}/addTest`, await req.json(), req);
}
