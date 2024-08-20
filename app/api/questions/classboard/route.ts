import { getData, getQueryString, putData } from '@/lib/api'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: any }) {
  // const { code } = params
  const querystring = getQueryString(req);
  return await getData(`/questions/classboard/${querystring}`, req)
}