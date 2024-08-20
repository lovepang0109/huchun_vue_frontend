import { getData, getQueryString } from '@/lib/api'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: any }) {
  const { testId } = params
  return await getData(`/attempts/psychoClassroom/${testId}`, req)
}
