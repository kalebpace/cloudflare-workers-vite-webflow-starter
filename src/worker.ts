const isProduction = process.env.NODE_ENV === "production";

const clientEntrypoint = isProduction
  ? "/main.js"
  : (await import("./main?url")).default;

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const requestUrl = new URL(request.url);

    if (
      (isProduction && requestUrl.pathname.startsWith(clientEntrypoint)) ||
      requestUrl.pathname.startsWith("/assets")
    ) {
      return env.ASSETS.fetch(requestUrl);
    }

    if (request.method === "OPTIONS") {
      return handleCorsPreflight(request);
    } else if (
      request.method === "GET" ||
      request.method === "HEAD" ||
      request.method === "POST"
    ) {
      return handleProxyRequest(request, env);
    } else {
      return new Response(null, {
        status: 405,
        statusText: "Method Not Allowed",
      });
    }
  },
} satisfies ExportedHandler<Env>;

async function handleProxyRequest(request: Request, env: Env) {
  const url = new URL(request.url);
  const targetUrl = new URL(import.meta.env.WEBFLOW_SITE_URL);

  const isWebflowPreviewEnv =
    targetUrl.hostname.startsWith("preview") &&
    targetUrl.pathname.startsWith("/preview");

  if (url.pathname === "/" && isWebflowPreviewEnv) {
    return Response.redirect(
      `${url.origin}${targetUrl.pathname}${targetUrl.search}`,
      301,
    );
  } else {
    const response = await fetch(
      `${targetUrl.origin}${url.pathname}${url.search}`,
      isWebflowPreviewEnv ? request : undefined,
    );

    const injectScript = new HTMLRewriter().on("head", new ScriptInjector());
    return injectScript.transform(response);
  }
}

class ScriptInjector extends HTMLRewriter {
  constructor() {
    super();
  }

  element(element: Element) {
    element.prepend(
      `<script src=${clientEntrypoint} type="module" defer></script>`,
      {
        html: true,
      },
    );
  }
}

async function handleCorsPreflight(request: Request) {
  if (
    request.headers.get("Origin") !== null &&
    request.headers.get("Access-Control-Request-Method") !== null &&
    request.headers.get("Access-Control-Request-Headers") !== null
  ) {
    // Handle CORS preflight requests.
    return new Response(null, {
      headers: {
        ...makeCorsHeaders(new URL(request.url)),
        "Access-Control-Allow-Headers":
          request.headers.get("Access-Control-Request-Headers") ?? "*",
      },
    });
  } else {
    // Handle standard OPTIONS request.
    return new Response(null, {
      headers: {
        Allow: "GET, HEAD, POST, OPTIONS",
      },
    });
  }
}

function makeCorsHeaders(url: URL) {
  return {
    "Access-Control-Allow-Origin": url.origin,
    "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
    "Access-Control-Max-Age": "86400",
  };
}
