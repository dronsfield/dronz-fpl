interface Info {
  url: string;
  status: number;
  method: string;
  data?: any;
}
export class BetterFetchError extends Error {
  info: Info;

  constructor(info: Info) {
    const { url, status, method } = info;
    const message = `${status} ${method} ${url}`;
    super(message);
    this.info = info;
  }

  log() {
    console.error(this, this.info);
  }
}

export type ContentType = "json" | "pdf" | "html" | "file";

function getContentTypeHeader(contentType: ContentType) {
  switch (contentType) {
    case "json":
      return `application/json`;
    case "pdf":
      return `application/pdf`;
    case "html":
      return `text/html`;
    case "file":
      return;
  }
}
async function getResponseData(resp: Response, contentType: ContentType) {
  switch (contentType) {
    case "json":
      if (resp.status === 204) return {};
      return resp.json();
    case "pdf":
      return resp.blob();
    case "html":
      return resp.text();
    case "file":
      return resp.json();
  }
}

async function betterFetch<T>(
  url: string,
  options?: { contentType?: ContentType; [key: string]: any }
): Promise<T> {
  let resp: Response | null = null;
  try {
    if (!options) options = {};
    let { contentType, ...otherOptions } = options;
    if (!contentType) contentType = "json";
    const contentTypeHeader = getContentTypeHeader(contentType);
    const headers = { ...options.headers };
    if (contentTypeHeader) headers["Content-Type"] = contentTypeHeader;
    const fetchOptions = { ...otherOptions, headers };
    resp = await fetch(url, fetchOptions);
    if (!resp.ok) {
      const error = new BetterFetchError({
        url,
        method: options.method || "GET",
        status: resp.status,
        data: await resp.text(),
      });
      throw error;
    }
    const data = await getResponseData(resp, contentType);
    return data;
  } catch (err: any) {
    // console.log("betterFetch caught error", err);
    if (err) {
      // console.log("resp body:", String((resp as any)?.body));
      // console.log("resp status:", (resp as any)?.status);
      // console.log("resp:", resp);
    }
    throw err;
  }
}

export default betterFetch;
