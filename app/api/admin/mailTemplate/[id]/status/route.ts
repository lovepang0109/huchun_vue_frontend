import { putData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: any }) {
  const { id } = params;
  return await putData(
    `/admin/mailTemplate/${id}/status`,
    await req.json(),
    req
  );
}
