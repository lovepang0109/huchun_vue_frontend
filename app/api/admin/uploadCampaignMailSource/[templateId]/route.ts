import { postData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest, { params }: { params: any }) {
  const { templateId } = params;
  return await postData(
    `/admin/uploadCampaignMailSource/${templateId}`,
    await req.json(),
    req
  );
}
