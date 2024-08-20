import { recoverPassword } from "@/lib/api";
import { AxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    await recoverPassword(await request.json())

    return NextResponse.json({ isOk: true });
  } catch (ex: AxiosError) {
    return NextResponse.json(ex.response.data, { status: ex.response.status })
  }
}
