import { getData, getQueryString } from '@/lib/api'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: any }) {
  const { testId } = params
  const querystring = getQueryString(req);
  return await getData(`/learningTest/getPracticeSet/${testId}${querystring}`, req)
}
