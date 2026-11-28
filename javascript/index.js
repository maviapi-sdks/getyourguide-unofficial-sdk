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
   * Every tour & activity GetYourGuide lists for a place, across all of the site's
   * pages: price, rating, review count, duration, next availability, image. `total` is
   * the site's own count; rows come in the site's popularity order, then the remaining
   * activities by ascending price.
   *
   * Each successful request uses 5 credits.
   */
  activitiesV2ByLocation(params) {
    return this.request("/activities-v2/{location}", params, ["location"]);
  }

  /**
   * Tour & activity listings for a GetYourGuide place in the site's popularity order:
   * the first page of the site's listing (24 rows), each with price, rating, review
   * count, next availability, place label and image.
   *
   * Each successful request uses 5 credits.
   */
  activitiesByLocation(params) {
    return this.request("/activities/{location}", params, ["location"]);
  }

  /**
   * Full detail for one activity (as /activity: title, description, images, price,
   * rating, reviews) plus where and how it happens: meeting point with address and
   * coordinates, other start points and a separate end point, pickup, the main
   * attraction (id, name, coordinates, URL) and the places visited with coordinates, the
   * city (id, name, slug) and country, duration with its lower and upper bound in
   * minutes, guide languages and the kind of guide offering them, category and the
   * site's numeric category ids, free cancellation and the cancellation policy, and the
   * activity URL.
   *
   * Each successful request uses 5 credits.
   */
  activityV2ById(params) {
    return this.request("/activity-v2/{id}", params, ["id"]);
  }

  /**
   * Full detail for one activity: title, description, images, starting price, average
   * rating, review count and a sample of recent reviews (author, rating, title, text,
   * date).
   *
   * Each successful request uses 5 credits.
   */
  activityById(params) {
    return this.request("/activity/{id}", params, ["id"]);
  }

  /**
   * Activity URLs listed in one GetYourGuide activity sitemap file (about 5000 per file;
   * URLs whose slugs hold characters other than lowercase letters, digits and hyphens
   * are left out), each with its activity id and place slug.
   *
   * Each successful request uses 5 credits.
   */
  catalog(params = {}) {
    return this.request("/catalog", params, []);
  }

  /**
   * A place's tour & activity listings in the site's popularity order (the first page of
   * 24 rows, as /activities), with the top `enrich` listings optionally carrying full
   * detail (description, images, recent reviews) in a `detail` object.
   *
   * Each successful request uses 5 credits.
   */
  explore(params = {}) {
    return this.request("/explore", params, []);
  }

  /**
   * Every tour & activity GetYourGuide lists for a place (as /activities-v2: all of the
   * site's pages, `total` = the site's count), with the top `enrich` activities
   * optionally carrying full detail (description, images, recent reviews) in a `detail`
   * object.
   *
   * Each successful request uses 5 credits.
   */
  exploreV2(params = {}) {
    return this.request("/explore-v2", params, []);
  }

  /**
   * GetYourGuide places (cities, regions, countries, attractions, neighborhoods) whose
   * name matches the text, in the site's relevance order, at most the site's top 20
   * suggestions: id, name, type, descriptor such as 'City in Italy', and the place slug
   * (e.g. venice-l35) that the location parameter of the other endpoints takes.
   *
   * Each successful request uses 5 credits.
   */
  locations(params = {}) {
    return this.request("/locations", params, []);
  }

  /**
   * One page (24 rows) of GetYourGuide's tour & activity search, by free text and/or
   * place, with the site's filters and sort orders. `total` is the site's own count of
   * results for the query; `has_more` says whether page+1 holds more.
   *
   * Each successful request uses 5 credits.
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
