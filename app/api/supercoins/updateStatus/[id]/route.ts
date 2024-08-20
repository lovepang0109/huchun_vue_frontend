import { putData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function PUT(request: NextRequest, { params }: { params: any }) {
  const { id } = params;
  const para = await request.json();
  return await putData(`/supercoins/updateStatus/${id}`, para, request);
}
