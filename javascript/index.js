// Unofficial GetYourGuide API client for JavaScript and TypeScript.
// Not affiliated with GetYourGuide. Endpoint reference: https://maviapi.com/apis/getyourguide

export const DEMO_KEY = "mvk_test_playground_5f3c1a8d";

/** An error status answered by the API. */
export class ApiError extends Error {
  constructor(status, code, message) {
    super(`${status} ${code}: ${message}`);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export class GetyourguideClient {
  /**
   * With no apiKey it uses the MAVIAPI_API_KEY environment variable, then the
   * shared demo key.
   */
  constructor({ apiKey, baseUrl, timeout = 120_000, fetch: fetcher } = {}) {
    const env = globalThis.process?.env ?? {};
    this.apiKey = apiKey || env.MAVIAPI_API_KEY || DEMO_KEY;
    let root = baseUrl || env.MAVIAPI_BASE_URL || "https://api.maviapi.com";
    while (root.endsWith("/")) root = root.slice(0, -1);
    this.baseUrl = root + "/v1/sites/getyourguide";
    this.timeout = timeout;
    this.fetch = fetcher ?? ((...args) => globalThis.fetch(...args));
  }

  /**
   * Tour & activity listings for a GetYourGuide location slug (e.g. venice-l35), each
   * with price, rating, next availability date and destination.
   *
   * Each successful request uses 25 credits.
   */
  activitiesLocation(params) {
    return this.request("/activities/{location}", params, ["location"]);
  }

  /**
   * Full detail for one activity by numeric id (e.g. 6851): title, description, images,
   * price, rating, review count and sample reviews.
   *
   * Each successful request uses 25 credits.
   */
  activityId(params) {
    return this.request("/activity/{id}", params, ["id"]);
  }

  /**
   * Enumerate all activity URLs from a GetYourGuide activity sitemap file (?index, ~5000
   * each); each entry has the activity id and location slug.
   */
  catalog(params = {}) {
    return this.request("/catalog", params, []);
  }

  /**
   * Resolve a location's tour/activity listings and optionally enrich the top N with
   * full detail (description, images, reviews) in one call.
   *
   * Each successful request uses 25 credits.
   */
  explore(params) {
    return this.request("/explore", params, ["location"]);
  }

  /** GET one endpoint path. Parameters named in the path go there, the rest in the query. */
  async request(path, params = {}, required = []) {
    for (const name of required) {
      if (params[name] == null) throw new TypeError(`Missing required parameter: ${name}`);
    }
    const query = new URLSearchParams();
    for (const [name, value] of Object.entries(params)) {
      if (value == null) continue;
      const token = `{${name}}`;
      if (path.includes(token)) path = path.replace(token, encodeURIComponent(String(value)));
      else query.set(name, String(value));
    }
    const search = query.toString();
    const response = await this.fetch(this.baseUrl + path + (search ? `?${search}` : ""), {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        Accept: "application/json",
        "User-Agent": "getyourguide-unofficial-sdk/0.1.0 (javascript)",
      },
      signal: AbortSignal.timeout(this.timeout),
    });
    const text = await response.text();
    let body = null;
    try {
      body = JSON.parse(text);
    } catch {}
    if (!response.ok) {
      throw new ApiError(response.status, body?.error ?? "http_error", body?.message ?? text.slice(0, 200));
    }
    return body;
  }
}
