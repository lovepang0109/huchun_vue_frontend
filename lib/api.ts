import { headers } from "next/headers";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import axios, { AxiosError } from "axios";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import redis from "./redis";
import fs from "fs";
import { ReadableOptions } from "stream";

const tzOffset = new Date().getTimezoneOffset();

// Add a request interceptor
axios.interceptors.request.use(async (request) => {


  let clientHeaders = headers();
  request.baseURL =
    process.env.NEXT_INTERNAL_API || process.env.NEXT_PUBLIC_API;
  request.headers.set("instancekey", clientHeaders.get("instancekey"));
  request.headers.set(
    "timezoneOffset",
    clientHeaders.get("timezoneOffset") || tzOffset
  );

  if (!request.headers["Content-Type"])
    request.headers.set("Content-Type", "application/json");

  if (request.url && request.url.indexOf("token=") > -1) {
    request.headers.set(
      "Authorization",
      "bearer " + request.url.split("token=")[1]
    );
  } else {
    const session = await getServerSession(authOptions);
    if (session && session.accessToken) {
      request.headers.set("Authorization", "bearer " + session.accessToken);
    }
  }

  return request;
});

// Add a response interceptor
axios.interceptors.response.use(async (response) => {
  return response.data;
});

export const getQueryString = (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams.toString();

  if (!searchParams) {
    return "";
  }

  return "?" + searchParams;
};

export const apiVersion = "/api/v1";

export const login = async (data = {}) => {
  return await axios.post<
    any,
    {
      token: string;
      tokenExpires: number;
      role: string;
    }
  >("/auth/local", data);
};

export const postAsGet = async (url = "", data = {}) => {
  return await axios.post(`${apiVersion}${url}`, data, {
    headers: { "X-HTTP-Method-Override": "GET" },
  });
};

export const getDataBasic = async (url = "") => {
  return await axios.get(`${apiVersion}${url}`);
};

export const postDataBasic = async (url = "", data: any) => {
  return await axios.post(`${apiVersion}${url}`, data);
};

export const getData = async (url = "", request: NextRequest) => {
  // if there is request object, response will be handled
  try {
    const data = await axios.get(
      `${apiVersion}${url}${getQueryString(request)}`
    );

    return NextResponse.json(data);
  } catch (ex: AxiosError) {
    if (ex.response) {
      return NextResponse.json(ex.response.data, {
        status: ex.response.status,
      });
    }

    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }
};

export const postData = async (
  url = "",
  data: any,
  request: NextRequest,
  header?: boolean
) => {
  // if there is request object, response will be handled
  try {
    if (header) {
      const res = await axios.post(
        `${apiVersion}${url}${getQueryString(request)}`,
        data,
        {
          headers: { "X-HTTP-Method-Override": "GET" },
        }
      );

      return NextResponse.json(res);
    } else {
      const res = await axios.post(
        `${apiVersion}${url}${getQueryString(request)}`,
        data
      );
      return NextResponse.json(res);
    }
  } catch (ex: AxiosError) {
    if (ex.response) {
      return NextResponse.json(ex.response.data, {
        status: ex.response.status,
      });
    }

    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }
};

export const putData = async (url = "", data: any, request: NextRequest) => {
  // if there is request object, response will be handled
  try {
    const res = await axios.put(
      `${apiVersion}${url}${getQueryString(request)}`,
      data
    );
    return NextResponse.json(res);
  } catch (ex: AxiosError) {
    if (ex.response) {
      return NextResponse.json(ex.response.data, {
        status: ex.response.status,
      });
    }

    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }
};

export const deleteData = async (url = "", request: NextRequest) => {
  try {
    const data = await axios.delete(
      `${apiVersion}${url}${getQueryString(request)}`
    );
    return NextResponse.json(data);
  } catch (ex: AxiosError) {
    if (ex.response) {
      return NextResponse.json(ex.response.data, {
        status: ex.response.status,
      });
    }

    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }
};

export const getSettings = async () => {
  const cachedSettings = await redis.get(
    `${headers().get("instancekey")},key=whiteLabel`
  );

  let settings = null;
  if (cachedSettings) {
    settings = JSON.parse(cachedSettings);
  } else {
    settings = await axios.get(`${apiVersion}/settings/getWhiteLabel`);
  }

  return settings;
};

export const getWebConfig = async () => {
  const webConfig = await redis.get(`webConfig`);

  return webConfig ? JSON.parse(webConfig) : { sites: [] };
};

export const recoverPassword = async (data: any) => {
  return await axios.post("/auth/local/recoverPassword", data);
};

export const confirmEmail = async (token: string) => {
  return await axios.get("/auth/local/confirm-email" + token);
};

export const confirmResetPasswordToken = async (token: string) => {
  return await axios.get(`/auth/local/confirmPasswordResetToken/${token}`);
};

export const refreshAuthToken = async () => {
  return await axios.get<any, { token: string; tokenExpires: number }>(
    "/auth/refreshToken"
  );
};

/**
 * Return a stream from the disk
 * @param {string} path - The location of the file
 * @param {ReadableOptions} options - The streamable options for the stream (ie how big are the chunks, start, end, etc).
 * @returns {ReadableStream} A readable stream of the file
 */
function streamFile(
  path: string,
  options?: ReadableOptions
): ReadableStream<Uint8Array> {
  const downloadStream = fs.createReadStream(path, options);

  return new ReadableStream({
    start(controller) {
      downloadStream.on("data", (chunk: Buffer) =>
        controller.enqueue(new Uint8Array(chunk))
      );
      downloadStream.on("end", () => controller.close());
      downloadStream.on("error", (error: NodeJS.ErrnoException) =>
        controller.error(error)
      );
    },
    cancel() {
      downloadStream.destroy();
    },
  });
}

export const getFile = async (url = "", request: NextRequest) => {
  try {
    const res: any = await axios.get(
      `${apiVersion}${url}${getQueryString(request)}`,
      {
        responseType: "blob",
      }
    );

    let file = new Blob([res]);
    // Get the file size
    const data: ReadableStream<Uint8Array> = file.stream();

    return new NextResponse(data, {
      status: 200,
      headers: new Headers({
        "content-disposition": `attachment; filename=${request.nextUrl.searchParams.get(
          "fileName"
        )}}`,
        "content-type": "application/pdf",
        "content-length": file.size + "",
      }),
    });
  } catch (ex: AxiosError) {
    if (ex.response) {
      return NextResponse.json(ex.response.data, {
        status: ex.response.status,
      });
    }

    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }
};
