import { getData, putData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function PUT(request: NextRequest, { params }: { params: any }) {
  const { query } = params;
  return await putData(`/users/sendForReviewDossier/${query}`, await request.json(), request);
}