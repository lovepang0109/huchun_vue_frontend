import { getWebConfig, postData } from '@/lib/api'
import { S3 } from 'aws-sdk';
import { NextRequest, NextResponse } from 'next/server'
import mime from "mime-types"

type Params = {
  params: { filePath: string };
};

function getS3File(awsConfig: any, fileKey: string) {
  return new Promise((resolve, reject) => {
    if (!awsConfig || !awsConfig.s3) {
      return reject('Invalid config')
    }
    var s3 = new S3({
      region: awsConfig.region,
      accessKeyId: awsConfig.s3.userAssets.accessKeyId,
      secretAccessKey: awsConfig.s3.userAssets.secretAccessKey,
      httpOptions: { timeout: 180000 }
    });

    let params = { Bucket: awsConfig.s3.userAssets.bucket, Key: fileKey };

    s3.headObject(params, function (err, metadata) {
      if (err) {
        return reject(err)
      }
      resolve(s3.getObject(params).createReadStream())
    });
  })
}

export async function GET(req: NextRequest, { params }: Params) {
  const filePath = params.filePath;
  if (!filePath) {
    return new NextResponse(null, { status: 400, statusText: "Bad Request" });
  }

  try {
    const webConfig = await getWebConfig()

    var idx = webConfig.sites.findIndex((con: any) => {
      return con.domain == req.nextUrl.hostname
    })

    if (idx == -1) {
      return new NextResponse(null, { status: 404, statusText: "File not found" });
    }

    const stream = await getS3File(webConfig.aws, webConfig.sites[idx].assets + req.nextUrl.pathname) as ReadableStream
    return new NextResponse(stream, {
      headers: {
        "Content-Type": mime.lookup(filePath) || "image/png",
        "Cache-Control": "public, max-age=31557600"
      },
    });
  } catch (ex) {
    return new NextResponse(null, { status: 400, statusText: "Bad Request" });
  }
}
