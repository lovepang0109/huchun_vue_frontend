import { postData } from '@/lib/api'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  return await postData('/tests/import', await req.json(), req)
}
