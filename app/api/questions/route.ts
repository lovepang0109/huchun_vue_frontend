import { postData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest, { params }: { params: any }) {
  // const { query } = params;
  return await postData(
    `/questions`,
    await request.json(),
    request
  );
}
