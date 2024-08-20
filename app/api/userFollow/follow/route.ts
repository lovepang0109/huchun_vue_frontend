import { putData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: any }) {
  return await putData(`/userFollow/follow`, await req.json(), req);
}