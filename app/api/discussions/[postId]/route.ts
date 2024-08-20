import { deleteData, getData, getQueryString, postData, putData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function DELETE(req: NextRequest, { params }: { params: any }) {
  const { postId } = params;
  return await deleteData(`/discussions/${postId}`, req);
}

export async function POST(req: NextRequest, { params }: { params: any }) {
  const { postId } = params;
  return await postData(`/discussions/${postId}`, await req.json(), req);
}

export async function PUT(req: NextRequest, { params }: { params: any }) {
  const { postId } = params;
  return await putData(`/discussions/${postId}`, await req.json(), req);
}

