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
      endpoint: '"w1i6.va.idrivee2-40.com',
      accessKeyId: 'pJxzwnMtfThtUdTsfmUH',
      secretAccessKey: 'wX8Nla0fnIVMAsyN7vr5F6AzvySjq6jq8GwTm2j4',
      httpOptions: { timeout: 180000 }
    });

    let params = { Bucket: awsConfig.s3.userAssets.bucket, Key: fileKey };

    s3.headObject(params, function (err, metadata) {
      if (err) {
        return reject(err)
      }
      resolve(s3.getObject(params).createReadStream())
    });
  });
}

export async function GET(req: NextRequest, { params }: Params) {
  const filePath = params.filePath;
  if (!filePath) {
    return new NextResponse(null, { status: 400, statusText: "Bad Request" });
  }

  try {
    // const webConfig = await getWebConfig()
    const res = await fetch(`${process.env.NEXT_INTERNAL_API || process.env.NEXT_PUBLIC_API}/api/v1/settings/webConfig`,
      {
        headers: { instancekey: 'perfectice-web-server' },
      })
    const webConfig = await res.json()
    console.log(webConfig, '=====')

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
