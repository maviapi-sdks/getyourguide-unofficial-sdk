// Unofficial GetYourGuide API client for .NET.
// Not affiliated with GetYourGuide. Endpoint reference: https://maviapi.com/apis/getyourguide

using System.Globalization;
using System.Net.Http.Headers;
using System.Text.Json;

namespace GetyourguideSdk;

/// <summary>An error status answered by the API.</summary>
public class ApiError : Exception
{
    public int Status { get; }
    public string Code { get; }

    public ApiError(int status, string code, string message) : base($"{status} {code}: {message}")
    {
        Status = status;
        Code = code;
    }
}

public class GetyourguideClient
{
    public const string DemoKey = "mvk_test_playground_5f3c1a8d";

    private readonly string _apiKey;
    private readonly string _baseUrl;
    private readonly HttpClient _http;

    /// <summary>
    /// With no apiKey it uses the MAVIAPI_API_KEY environment variable, then the
    /// shared demo key.
    /// </summary>
    public GetyourguideClient(string? apiKey = null, string? baseUrl = null, HttpClient? http = null)
    {
        _apiKey = First(apiKey, Environment.GetEnvironmentVariable("MAVIAPI_API_KEY"), DemoKey);
        var root = First(baseUrl, Environment.GetEnvironmentVariable("MAVIAPI_BASE_URL"), "https://api.maviapi.com");
        _baseUrl = root.TrimEnd('/') + "/v1/sites/getyourguide";
        _http = http ?? new HttpClient { Timeout = TimeSpan.FromSeconds(120) };
    }

    // Every tour & activity GetYourGuide lists for a location slug (e.g. venice-l35), all
    // pages: price, rating, review count, duration, next availability, image.
    // pagination.total matches the site's own count.
    //
    // Each successful request uses 10 credits for every 24 rows it returns (at least 10
    // credits).
    //
    // Parameters:
    //   location (string, required): GetYourGuide place slug in the {city}-l{id} form
    //     (from /catalog or an activity URL)
    //   limit (integer): Max activities per page (default 50, max 1000). Every page of
    //     the location is fetched once and cached, so any limit/offset is served from the
    //     same full list
    //   offset (integer): Activities to skip. Works up to pagination.total (the site's
    //     full count), not just the first page
    public Task<JsonElement> ActivitiesV2ByLocationAsync(IDictionary<string, object?> parameters, CancellationToken cancellationToken = default) =>
        GetAsync("/activities-v2/{location}", parameters, cancellationToken, "location");

    // Tour & activity listings for a GetYourGuide location slug (e.g. venice-l35), each
    // with price, rating, next availability date and destination.
    //
    // Each successful request uses 10 credits.
    //
    // Parameters:
    //   location (string, required): GetYourGuide place slug in the {city}-l{id} form
    //     (from /catalog or an activity URL)
    //   limit (integer): Max items per page (default 50, max 200)
    //   offset (integer): Items to skip for pagination
    public Task<JsonElement> ActivitiesByLocationAsync(IDictionary<string, object?> parameters, CancellationToken cancellationToken = default) =>
        GetAsync("/activities/{location}", parameters, cancellationToken, "location");

    // Full detail for one activity by numeric id (e.g. 6851), as /activity/{id}, plus
    // where it happens: meeting point (name, address, coordinates), other start and end
    // points, the main attraction and stops with coordinates, city slug and id, duration
    // in minutes, languages, category, free cancellation and the activity url.
    //
    // Each successful request uses 10 credits.
    //
    // Parameters:
    //   id (string, required): Numeric activity id (the …-t<id> in an activity URL)
    public Task<JsonElement> ActivityV2ByIdAsync(IDictionary<string, object?> parameters, CancellationToken cancellationToken = default) =>
        GetAsync("/activity-v2/{id}", parameters, cancellationToken, "id");

    // Full detail for one activity by numeric id (e.g. 6851): title, description, images,
    // price, rating, review count and sample reviews.
    //
    // Each successful request uses 10 credits.
    //
    // Parameters:
    //   id (string, required): Numeric activity id (the …-t<id> in an activity URL)
    public Task<JsonElement> ActivityByIdAsync(IDictionary<string, object?> parameters, CancellationToken cancellationToken = default) =>
        GetAsync("/activity/{id}", parameters, cancellationToken, "id");

    // Enumerate all activity URLs from a GetYourGuide activity sitemap file (?index, ~5000
    // each); each entry has the activity id and location slug.
    //
    // Each successful request uses 1 credit for every 5000 rows it returns (at least 1
    // credit).
    //
    // Parameters:
    //   index (integer): Which activity sitemap file to read (0-based)
    //   limit (integer): Max items per page (default 100, max 5000)
    //   offset (integer): Items to skip for pagination
    public Task<JsonElement> CatalogAsync(IDictionary<string, object?> parameters, CancellationToken cancellationToken = default) =>
        GetAsync("/catalog", parameters, cancellationToken);

    // Resolve a location's tour/activity listings and optionally enrich the top N with
    // full detail (description, images, reviews) in one call.
    //
    // Each successful request uses 10 credits.
    //
    // Parameters:
    //   location (string, required): GetYourGuide place slug, e.g. venice-l35
    //   detail (string): When true, enrich the top `enrich` listings with detail
    //     (description, images, reviews). One of: true, false
    //   enrich (integer): How many top listings to enrich when detail=true (1-5). One
    //     of: 1, 2, 3, 4, 5
    //   limit (integer): Max items per page (default 50, max 200)
    //   offset (integer): Items to skip for pagination
    public Task<JsonElement> ExploreAsync(IDictionary<string, object?> parameters, CancellationToken cancellationToken = default) =>
        GetAsync("/explore", parameters, cancellationToken, "location");

    // Every tour/activity GetYourGuide lists for a location (all pages, pagination.total =
    // the site's count), optionally with full detail (description, images, reviews) for
    // the top N, in one call.
    //
    // Each successful request uses 10 credits for every 24 rows it returns (at least 10
    // credits).
    //
    // Parameters:
    //   location (string, required): GetYourGuide place slug, e.g. venice-l35
    //   detail (string): When true, enrich the top `enrich` activities with detail
    //     (description, images, reviews). One of: true, false
    //   enrich (integer): How many top activities to enrich when detail=true (1-5). One
    //     of: 1, 2, 3, 4, 5
    //   limit (integer): Max activities per page (default 50, max 1000). Every page of
    //     the location is fetched once and cached, so any limit/offset is served from the
    //     same full list
    //   offset (integer): Activities to skip. Works up to pagination.total (the site's
    //     full count), not just the first page
    public Task<JsonElement> ExploreV2Async(IDictionary<string, object?> parameters, CancellationToken cancellationToken = default) =>
        GetAsync("/explore-v2", parameters, cancellationToken, "location");

    // Find GetYourGuide places (cities, regions, countries, attractions) by name: id,
    // name, type, descriptor (e.g. 'City in Italy') and the place slug (e.g. venice-l35)
    // that /activities, /activities-v2, /explore and /search take.
    //
    // Each successful request uses 10 credits.
    //
    // Parameters:
    //   q (string, required): Name of a city, region, country or attraction (any case,
    //     accents optional)
    //   limit (integer): Max places to return (the site suggests up to 20)
    //   offset (integer)
    public Task<JsonElement> LocationsAsync(IDictionary<string, object?> parameters, CancellationToken cancellationToken = default) =>
        GetAsync("/locations", parameters, cancellationToken, "q");

    // Search GetYourGuide tours & activities by free text and/or place, with the site's
    // filters (dates, price range, duration, minimum rating, languages, start time,
    // features, categories, departure place) and sort orders. 24 results per page;
    // data.total is the site's own count.
    //
    // Each successful request uses 10 credits for every 24 rows it returns (at least 10
    // credits).
    //
    // Parameters:
    //   q (string): Free text, as typed in the site's search box (an activity,
    //     attraction or place). q, location or both are required
    //   location (string): Limit to one place: a place slug from /locations (venice-l35)
    //     or its numeric id (35)
    //   date_from (string): Only activities available on or after this date
    //     (YYYY-MM-DD). Alone, it searches that one day
    //   date_to (string): Last day of the date range (YYYY-MM-DD); needs date_from
    //   min_price (number): Lowest starting price, in EUR
    //   max_price (number): Highest starting price, in EUR
    //   sort (string): Order of the results. With q, the text match is weighed in too.
    //     One of: popularity, price_asc, price_desc, rating_desc
    //   languages (string): Guide/audio languages, comma separated ISO codes (en, de,
    //     fr, es, it, ...): activities offered in any of them
    //   duration (string): Durations, comma separated: 0-3h, 3-5h, 5-7h, full-day,
    //     2-days, 3-days, 4-days, 5-days-plus
    //   min_rating (string): Minimum average rating. One of: 3.0, 3.5, 4.0, 4.5
    //   start_time (string): Start times, comma separated: morning (before 12 PM),
    //     afternoon (12-5 PM), evening (after 5 PM)
    //   features (string): Features, comma separated: private, small-group,
    //     skip-the-line, wheelchair-accessible, hotel-pickup, originals
    //   categories (string): Category ids, comma separated: the tc<n> in a category page
    //     address (gondola-tours-tc264 -> tc-264)
    //   departs_from (string): Departure places, comma separated slugs or ids from
    //     /locations
    //   page (integer): Page of the site's results, 24 per page (1 to 34; the site
    //     serves no pages past about 34). data.total is the full count; narrow the query
    //     with filters to reach more rows
    //   limit (integer): Rows of this page to return (default 50: the whole 24-row page)
    //   offset (integer): Rows of this page to skip
    public Task<JsonElement> SearchAsync(IDictionary<string, object?> parameters, CancellationToken cancellationToken = default) =>
        GetAsync("/search", parameters, cancellationToken);

    private static string First(params string?[] values) => values.First(value => !string.IsNullOrEmpty(value))!;

    private async Task<JsonElement> GetAsync(string path, IDictionary<string, object?> parameters, CancellationToken cancellationToken, params string[] required)
    {
        foreach (var name in required)
        {
            if (!parameters.TryGetValue(name, out var given) || given is null)
            {
                throw new ArgumentException($"Missing required parameter: {name}");
            }
        }
        var query = new List<string>();
        foreach (var (name, value) in parameters)
        {
            if (value is null)
            {
                continue;
            }
            var text = value switch
            {
                bool flag => flag ? "true" : "false",
                IFormattable number => number.ToString(null, CultureInfo.InvariantCulture),
                _ => value.ToString() ?? "",
            };
            var token = "{" + name + "}";
            if (path.Contains(token))
            {
                path = path.Replace(token, Uri.EscapeDataString(text));
            }
            else
            {
                query.Add(Uri.EscapeDataString(name) + "=" + Uri.EscapeDataString(text));
            }
        }
        var url = _baseUrl + path + (query.Count > 0 ? "?" + string.Join("&", query) : "");
        using var request = new HttpRequestMessage(HttpMethod.Get, url);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
        request.Headers.Accept.ParseAdd("application/json");
        request.Headers.UserAgent.ParseAdd("getyourguide-unofficial-sdk/0.1.0 (csharp)");
        using var response = await _http.SendAsync(request, cancellationToken);
        var body = await response.Content.ReadAsStringAsync(cancellationToken);
        JsonElement? data = null;
        try
        {
            using var document = JsonDocument.Parse(body);
            data = document.RootElement.Clone();
        }
        catch (JsonException)
        {
        }
        if (response.IsSuccessStatusCode && data is JsonElement result)
        {
            return result;
        }
        string Field(string name, string fallback) =>
            data is { ValueKind: JsonValueKind.Object } detail && detail.TryGetProperty(name, out var field) && field.ValueKind == JsonValueKind.String
                ? field.GetString()!
                : fallback;
        throw new ApiError((int)response.StatusCode, Field("error", "http_error"), Field("message", body.Length > 200 ? body[..200] : body));
    }
}
