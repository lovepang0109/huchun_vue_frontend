import { putData } from '@/lib/api'
import { NextRequest } from 'next/server'

export async function PUT(request: NextRequest, { params }: { params: any }) {
  const { code } = params;
  const data = await request.json()
  return await putData(`/questions/classboard/${code}/answer`, data, request);
}
