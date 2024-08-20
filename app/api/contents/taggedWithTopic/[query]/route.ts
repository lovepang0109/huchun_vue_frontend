import { getData } from '@/lib/api'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: any }) {
  const { query } = params
  return await getData(`/contents/taggedWithTopic/${query}`, request)
}
