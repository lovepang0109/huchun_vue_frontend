import { getData, getQueryString, putData } from '@/lib/api'
import { toQueryString } from "@/lib/validator";
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: any }) {
  const { code } = params
  const querystring = getQueryString(req);
  return await getData(`/questions/classboard/${code}${querystring}`, req)
}

export async function PUT(request: NextRequest, { params }: { params: any }) {
  const { code } = params;
  return await putData(`/questions/classboard/${code}`, {showAnswer : true}, request);
}
