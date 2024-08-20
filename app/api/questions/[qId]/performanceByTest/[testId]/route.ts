import { getData } from '@/lib/api'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: any }) {
  const { qid, testId } = params
  return await getData(`/questions/${qid}/performanceByTest/${testId}`, req)
}
