import { putData } from "@/lib/api";
import { NextRequest } from "next/server";
export async function PUT(request: NextRequest, { params }: { params: any }) {
  const { locId } = params;

  return await putData(
    `/institute/addBannerImage/${locId}`,
    await request.json(),
    request
  );
}