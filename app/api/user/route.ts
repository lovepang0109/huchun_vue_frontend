import { postData } from "@/lib/api";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // const requestHeaders = new Headers(request.headers);
}

export async function POST(request: NextRequest) {
  return await postData('/users', await request.json(), request)
}

export async function PUT(request: NextRequest) {

}

export async function DELETE(request: NextRequest) {

}