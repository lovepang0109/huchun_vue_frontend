import { postData } from '@/lib/api'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest, { params }: { params: any }) {
  const para = await request.json();
  return await postData(
    `/users/remove`,
    para,
    request,
  )
}
