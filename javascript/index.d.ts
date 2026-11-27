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

export interface ActivitiesV2ByLocationParams {
  /**
   * GetYourGuide place slug in the {city}-l{id} form (from /catalog or an activity URL)
   */
  "location": string;
  /**
   * Max activities per page (default 50, max 1000). Every page of the location is
   * fetched once and cached, so any limit/offset is served from the same full list
   */
  "limit"?: number;
  /**
   * Activities to skip. Works up to pagination.total (the site's full count), not just
   * the first page
   */
  "offset"?: number;
}

export interface ActivitiesByLocationParams {
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

export interface ActivityV2ByIdParams {
  /**
   * Numeric activity id (the …-t<id> in an activity URL)
   */
  "id": string;
}

export interface ActivityByIdParams {
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

export interface ExploreV2Params {
  /**
   * GetYourGuide place slug, e.g. venice-l35
   */
  "location": string;
  /**
   * When true, enrich the top `enrich` activities with detail (description, images,
   * reviews). One of: true, false
   */
  "detail"?: string;
  /**
   * How many top activities to enrich when detail=true (1-5). One of: 1, 2, 3, 4, 5
   */
  "enrich"?: number;
  /**
   * Max activities per page (default 50, max 1000). Every page of the location is
   * fetched once and cached, so any limit/offset is served from the same full list
   */
  "limit"?: number;
  /**
   * Activities to skip. Works up to pagination.total (the site's full count), not just
   * the first page
   */
  "offset"?: number;
}

export interface LocationsParams {
  /**
   * Name of a city, region, country or attraction (any case, accents optional)
   */
  "q": string;
  /**
   * Max places to return (the site suggests up to 20)
   */
  "limit"?: number;
  "offset"?: number;
}

export interface SearchParams {
  /**
   * Free text, as typed in the site's search box (an activity, attraction or place). q,
   * location or both are required
   */
  "q"?: string;
  /**
   * Limit to one place: a place slug from /locations (venice-l35) or its numeric id (35)
   */
  "location"?: string;
  /**
   * Only activities available on or after this date (YYYY-MM-DD). Alone, it searches
   * that one day
   */
  "date_from"?: string;
  /**
   * Last day of the date range (YYYY-MM-DD); needs date_from
   */
  "date_to"?: string;
  /**
   * Lowest starting price, in EUR
   */
  "min_price"?: number;
  /**
   * Highest starting price, in EUR
   */
  "max_price"?: number;
  /**
   * Order of the results. With q, the text match is weighed in too. One of: popularity,
   * price_asc, price_desc, rating_desc
   */
  "sort"?: string;
  /**
   * Guide/audio languages, comma separated ISO codes (en, de, fr, es, it, ...):
   * activities offered in any of them
   */
  "languages"?: string;
  /**
   * Durations, comma separated: 0-3h, 3-5h, 5-7h, full-day, 2-days, 3-days, 4-days,
   * 5-days-plus
   */
  "duration"?: string;
  /**
   * Minimum average rating. One of: 3.0, 3.5, 4.0, 4.5
   */
  "min_rating"?: string;
  /**
   * Start times, comma separated: morning (before 12 PM), afternoon (12-5 PM), evening
   * (after 5 PM)
   */
  "start_time"?: string;
  /**
   * Features, comma separated: private, small-group, skip-the-line,
   * wheelchair-accessible, hotel-pickup, originals
   */
  "features"?: string;
  /**
   * Category ids, comma separated: the tc<n> in a category page address
   * (gondola-tours-tc264 -> tc-264)
   */
  "categories"?: string;
  /**
   * Departure places, comma separated slugs or ids from /locations
   */
  "departs_from"?: string;
  /**
   * Page of the site's results, 24 per page (1 to 34; the site serves no pages past
   * about 34). data.total is the full count; narrow the query with filters to reach more
   * rows
   */
  "page"?: number;
  /**
   * Rows of this page to return (default 50: the whole 24-row page)
   */
  "limit"?: number;
  /**
   * Rows of this page to skip
   */
  "offset"?: number;
}

export declare class GetyourguideClient {
  constructor(options?: ClientOptions);
  request(path: string, params?: Record<string, unknown>, required?: string[]): Promise<Record<string, any>>;
  /**
   * Every tour & activity GetYourGuide lists for a location slug (e.g. venice-l35), all
   * pages: price, rating, review count, duration, next availability, image.
   * pagination.total matches the site's own count.
   *
   * Each successful request uses 10 credits for every 24 rows it returns (at least 10
   * credits).
   *
   * Parameters:
   *   location (string, required): GetYourGuide place slug in the {city}-l{id} form
   *     (from /catalog or an activity URL)
   *   limit (integer): Max activities per page (default 50, max 1000). Every page of
   *     the location is fetched once and cached, so any limit/offset is served from the
   *     same full list
   *   offset (integer): Activities to skip. Works up to pagination.total (the site's
   *     full count), not just the first page
   */
  activitiesV2ByLocation(params: ActivitiesV2ByLocationParams): Promise<Record<string, any>>;
  /**
   * Tour & activity listings for a GetYourGuide location slug (e.g. venice-l35), each
   * with price, rating, next availability date and destination.
   *
   * Each successful request uses 10 credits.
   *
   * Parameters:
   *   location (string, required): GetYourGuide place slug in the {city}-l{id} form
   *     (from /catalog or an activity URL)
   *   limit (integer): Max items per page (default 50, max 200)
   *   offset (integer): Items to skip for pagination
   */
  activitiesByLocation(params: ActivitiesByLocationParams): Promise<Record<string, any>>;
  /**
   * Full detail for one activity by numeric id (e.g. 6851), as /activity/{id}, plus
   * where it happens: meeting point (name, address, coordinates), other start and end
   * points, the main attraction and stops with coordinates, city slug and id, duration
   * in minutes, languages, category, free cancellation and the activity url.
   *
   * Each successful request uses 10 credits.
   *
   * Parameters:
   *   id (string, required): Numeric activity id (the …-t<id> in an activity URL)
   */
  activityV2ById(params: ActivityV2ByIdParams): Promise<Record<string, any>>;
  /**
   * Full detail for one activity by numeric id (e.g. 6851): title, description, images,
   * price, rating, review count and sample reviews.
   *
   * Each successful request uses 10 credits.
   *
   * Parameters:
   *   id (string, required): Numeric activity id (the …-t<id> in an activity URL)
   */
  activityById(params: ActivityByIdParams): Promise<Record<string, any>>;
  /**
   * Enumerate all activity URLs from a GetYourGuide activity sitemap file (?index, ~5000
   * each); each entry has the activity id and location slug.
   *
   * Each successful request uses 1 credit for every 5000 rows it returns (at least 1
   * credit).
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
   * Each successful request uses 10 credits.
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
  /**
   * Every tour/activity GetYourGuide lists for a location (all pages, pagination.total =
   * the site's count), optionally with full detail (description, images, reviews) for
   * the top N, in one call.
   *
   * Each successful request uses 10 credits for every 24 rows it returns (at least 10
   * credits).
   *
   * Parameters:
   *   location (string, required): GetYourGuide place slug, e.g. venice-l35
   *   detail (string): When true, enrich the top `enrich` activities with detail
   *     (description, images, reviews). One of: true, false
   *   enrich (integer): How many top activities to enrich when detail=true (1-5). One
   *     of: 1, 2, 3, 4, 5
   *   limit (integer): Max activities per page (default 50, max 1000). Every page of
   *     the location is fetched once and cached, so any limit/offset is served from the
   *     same full list
   *   offset (integer): Activities to skip. Works up to pagination.total (the site's
   *     full count), not just the first page
   */
  exploreV2(params: ExploreV2Params): Promise<Record<string, any>>;
  /**
   * Find GetYourGuide places (cities, regions, countries, attractions) by name: id,
   * name, type, descriptor (e.g. 'City in Italy') and the place slug (e.g. venice-l35)
   * that /activities, /activities-v2, /explore and /search take.
   *
   * Each successful request uses 10 credits.
   *
   * Parameters:
   *   q (string, required): Name of a city, region, country or attraction (any case,
   *     accents optional)
   *   limit (integer): Max places to return (the site suggests up to 20)
   *   offset (integer)
   */
  locations(params: LocationsParams): Promise<Record<string, any>>;
  /**
   * Search GetYourGuide tours & activities by free text and/or place, with the site's
   * filters (dates, price range, duration, minimum rating, languages, start time,
   * features, categories, departure place) and sort orders. 24 results per page;
   * data.total is the site's own count.
   *
   * Each successful request uses 10 credits for every 24 rows it returns (at least 10
   * credits).
   *
   * Parameters:
   *   q (string): Free text, as typed in the site's search box (an activity,
   *     attraction or place). q, location or both are required
   *   location (string): Limit to one place: a place slug from /locations (venice-l35)
   *     or its numeric id (35)
   *   date_from (string): Only activities available on or after this date
   *     (YYYY-MM-DD). Alone, it searches that one day
   *   date_to (string): Last day of the date range (YYYY-MM-DD); needs date_from
   *   min_price (number): Lowest starting price, in EUR
   *   max_price (number): Highest starting price, in EUR
   *   sort (string): Order of the results. With q, the text match is weighed in too.
   *     One of: popularity, price_asc, price_desc, rating_desc
   *   languages (string): Guide/audio languages, comma separated ISO codes (en, de,
   *     fr, es, it, ...): activities offered in any of them
   *   duration (string): Durations, comma separated: 0-3h, 3-5h, 5-7h, full-day,
   *     2-days, 3-days, 4-days, 5-days-plus
   *   min_rating (string): Minimum average rating. One of: 3.0, 3.5, 4.0, 4.5
   *   start_time (string): Start times, comma separated: morning (before 12 PM),
   *     afternoon (12-5 PM), evening (after 5 PM)
   *   features (string): Features, comma separated: private, small-group,
   *     skip-the-line, wheelchair-accessible, hotel-pickup, originals
   *   categories (string): Category ids, comma separated: the tc<n> in a category page
   *     address (gondola-tours-tc264 -> tc-264)
   *   departs_from (string): Departure places, comma separated slugs or ids from
   *     /locations
   *   page (integer): Page of the site's results, 24 per page (1 to 34; the site
   *     serves no pages past about 34). data.total is the full count; narrow the query
   *     with filters to reach more rows
   *   limit (integer): Rows of this page to return (default 50: the whole 24-row page)
   *   offset (integer): Rows of this page to skip
   */
  search(params?: SearchParams): Promise<Record<string, any>>;
}
