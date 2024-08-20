import { getData } from '@/lib/api'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: any }) {
  const { qId } = params;
  return await getData(`/tests/feedbackRating/${qId}`,  req);
}