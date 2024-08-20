import { getData, postData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  console.log("+adsfkjadslkfjkdsafkdsafkdf");
  return await getData(`/course`, req);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  return await postData(`/course`, data, req);
}
