import { getData, deleteData, putData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest, { params }: { params: any }) {
  const { testId } = params;
  return await getData(`/tests/${testId}`, req);
}

export async function PUT(req: NextRequest, { params }: { params: any }) {
  const { testId } = params;
  return await putData(`/tests/${testId}`, await req.json(), req);
}

export async function DELETE(req: NextRequest, { params }: { params: any }) {
  const { testId } = params;
  return await deleteData(`/tests/${testId}`, req);
}
