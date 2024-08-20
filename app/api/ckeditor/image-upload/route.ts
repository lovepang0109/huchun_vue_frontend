import { postData } from '@/lib/api'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  console.log('ckeditor-image-upload: ', request.json())
  return await postData(
    `/files/ckUpload/image?mode=simpleUpload`,
    await request.json(),
    request,
  )
}
