import { putData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function PUT(req: NextRequest) {
  return await putData(
    `/institute/changeActiveInstitute`,
    await req.json(),
    req
  );
}
