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
   * Every tour & activity GetYourGuide lists for a location slug (e.g. venice-l35), all
   * pages: price, rating, review count, duration, next availability, image.
   * pagination.total matches the site's own count.
   *
   * Each successful request uses 10 credits for every 24 rows it returns (at least 10
   * credits).
   */
  activitiesV2ByLocation(params) {
    return this.request("/activities-v2/{location}", params, ["location"]);
  }

  /**
   * Tour & activity listings for a GetYourGuide location slug (e.g. venice-l35), each
   * with price, rating, next availability date and destination.
   *
   * Each successful request uses 10 credits.
   */
  activitiesByLocation(params) {
    return this.request("/activities/{location}", params, ["location"]);
  }

  /**
   * Full detail for one activity by numeric id (e.g. 6851), as /activity/{id}, plus
   * where it happens: meeting point (name, address, coordinates), other start and end
   * points, the main attraction and stops with coordinates, city slug and id, duration
   * in minutes, languages, category, free cancellation and the activity url.
   *
   * Each successful request uses 10 credits.
   */
  activityV2ById(params) {
    return this.request("/activity-v2/{id}", params, ["id"]);
  }

  /**
   * Full detail for one activity by numeric id (e.g. 6851): title, description, images,
   * price, rating, review count and sample reviews.
   *
   * Each successful request uses 10 credits.
   */
  activityById(params) {
    return this.request("/activity/{id}", params, ["id"]);
  }

  /**
   * Enumerate all activity URLs from a GetYourGuide activity sitemap file (?index, ~5000
   * each); each entry has the activity id and location slug.
   *
   * Each successful request uses 1 credit for every 5000 rows it returns (at least 1
   * credit).
   */
  catalog(params = {}) {
    return this.request("/catalog", params, []);
  }

  /**
   * Resolve a location's tour/activity listings and optionally enrich the top N with
   * full detail (description, images, reviews) in one call.
   *
   * Each successful request uses 10 credits.
   */
  explore(params) {
    return this.request("/explore", params, ["location"]);
  }

  /**
   * Every tour/activity GetYourGuide lists for a location (all pages, pagination.total =
   * the site's count), optionally with full detail (description, images, reviews) for
   * the top N, in one call.
   *
   * Each successful request uses 10 credits for every 24 rows it returns (at least 10
   * credits).
   */
  exploreV2(params) {
    return this.request("/explore-v2", params, ["location"]);
  }

  /**
   * Find GetYourGuide places (cities, regions, countries, attractions) by name: id,
   * name, type, descriptor (e.g. 'City in Italy') and the place slug (e.g. venice-l35)
   * that /activities, /activities-v2, /explore and /search take.
   *
   * Each successful request uses 10 credits.
   */
  locations(params) {
    return this.request("/locations", params, ["q"]);
  }

  /**
   * Search GetYourGuide tours & activities by free text and/or place, with the site's
   * filters (dates, price range, duration, minimum rating, languages, start time,
   * features, categories, departure place) and sort orders. 24 results per page;
   * data.total is the site's own count.
   *
   * Each successful request uses 10 credits for every 24 rows it returns (at least 10
   * credits).
   */
  search(params = {}) {
    return this.request("/search", params, []);
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
