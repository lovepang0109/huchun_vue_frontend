import { putData } from "@/lib/api";
import { NextRequest } from "next/server";
export async function PUT(request: NextRequest, { params }: { params: any }) {
  const { id } = params;

  return await putData(
    `/institute/updateInstitutePrefernces/${id}`,
    await request.json(),
    request
  );
}
