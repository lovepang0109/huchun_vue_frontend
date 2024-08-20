import { postData } from '@/lib/api'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  return await postData(`/attempts/start`, await request.json(), request)
}
