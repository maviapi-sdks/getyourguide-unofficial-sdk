export declare const DEMO_KEY: string;

export interface ClientOptions {
  /** Your maviapi API key. Default: the MAVIAPI_API_KEY environment variable, then the shared demo key. */
  apiKey?: string;
  baseUrl?: string;
  /** Milliseconds. Default 120000. */
  timeout?: number;
  fetch?: typeof fetch;
}

/** An error status answered by the API. */
export declare class ApiError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string);
}

export interface ActivitiesLocationParams {
  /**
   * GetYourGuide place slug in the {city}-l{id} form (from /catalog or an activity URL)
   */
  "location": string;
  /**
   * Max items per page (default 50, max 200)
   */
  "limit"?: number;
  /**
   * Items to skip for pagination
   */
  "offset"?: number;
}

export interface ActivityIdParams {
  /**
   * Numeric activity id (the …-t<id> in an activity URL)
   */
  "id": string;
}

export interface CatalogParams {
  /**
   * Which activity sitemap file to read (0-based)
   */
  "index"?: number;
  /**
   * Max items per page (default 100, max 5000)
   */
  "limit"?: number;
  /**
   * Items to skip for pagination
   */
  "offset"?: number;
}

export interface ExploreParams {
  /**
   * GetYourGuide place slug, e.g. venice-l35
   */
  "location": string;
  /**
   * When true, enrich the top `enrich` listings with detail (description, images,
   * reviews). One of: true, false
   */
  "detail"?: string;
  /**
   * How many top listings to enrich when detail=true (1-5). One of: 1, 2, 3, 4, 5
   */
  "enrich"?: number;
  /**
   * Max items per page (default 50, max 200)
   */
  "limit"?: number;
  /**
   * Items to skip for pagination
   */
  "offset"?: number;
}

export declare class GetyourguideClient {
  constructor(options?: ClientOptions);
  request(path: string, params?: Record<string, unknown>, required?: string[]): Promise<Record<string, any>>;
  /**
   * Tour & activity listings for a GetYourGuide location slug (e.g. venice-l35), each
   * with price, rating, next availability date and destination.
   *
   * Each successful request uses 25 credits.
   *
   * Parameters:
   *   location (string, required): GetYourGuide place slug in the {city}-l{id} form
   *     (from /catalog or an activity URL)
   *   limit (integer): Max items per page (default 50, max 200)
   *   offset (integer): Items to skip for pagination
   */
  activitiesLocation(params: ActivitiesLocationParams): Promise<Record<string, any>>;
  /**
   * Full detail for one activity by numeric id (e.g. 6851): title, description, images,
   * price, rating, review count and sample reviews.
   *
   * Each successful request uses 25 credits.
   *
   * Parameters:
   *   id (string, required): Numeric activity id (the …-t<id> in an activity URL)
   */
  activityId(params: ActivityIdParams): Promise<Record<string, any>>;
  /**
   * Enumerate all activity URLs from a GetYourGuide activity sitemap file (?index, ~5000
   * each); each entry has the activity id and location slug.
   *
   * Parameters:
   *   index (integer): Which activity sitemap file to read (0-based)
   *   limit (integer): Max items per page (default 100, max 5000)
   *   offset (integer): Items to skip for pagination
   */
  catalog(params?: CatalogParams): Promise<Record<string, any>>;
  /**
   * Resolve a location's tour/activity listings and optionally enrich the top N with
   * full detail (description, images, reviews) in one call.
   *
   * Each successful request uses 25 credits.
   *
   * Parameters:
   *   location (string, required): GetYourGuide place slug, e.g. venice-l35
   *   detail (string): When true, enrich the top `enrich` listings with detail
   *     (description, images, reviews). One of: true, false
   *   enrich (integer): How many top listings to enrich when detail=true (1-5). One
   *     of: 1, 2, 3, 4, 5
   *   limit (integer): Max items per page (default 50, max 200)
   *   offset (integer): Items to skip for pagination
   */
  explore(params: ExploreParams): Promise<Record<string, any>>;
}
