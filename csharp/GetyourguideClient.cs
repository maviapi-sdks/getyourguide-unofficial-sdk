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

    // Every tour & activity GetYourGuide lists for a place, across all of the site's
    // pages: price, rating, review count, duration, next availability, image. `total` is
    // the site's own count; rows come in the site's popularity order, then the remaining
    // activities by ascending price.
    //
    // Each successful request uses 5 credits.
    //
    // Parameters:
    //   location (string, required): GetYourGuide place slug in the {city}-l{id} form,
    //     e.g. venice-l35 (from /locations, /catalog or an activity URL)
    //   limit (integer): Rows in one page, 1 to 1000 (default 50)
    //   offset (integer): Rows to skip before the page starts (default 0)
    //   undefined (string)
    //   undefined (string)
    //   undefined (string)
    public Task<JsonElement> ActivitiesV2ByLocationAsync(IDictionary<string, object?> parameters, CancellationToken cancellationToken = default) =>
        GetAsync("/activities-v2/{location}", parameters, cancellationToken, "location");

    // Tour & activity listings for a GetYourGuide place in the site's popularity order:
    // the first page of the site's listing (24 rows), each with price, rating, review
    // count, next availability, place label and image.
    //
    // Each successful request uses 5 credits.
    //
    // Parameters:
    //   location (string, required): GetYourGuide place slug in the {city}-l{id} form,
    //     e.g. venice-l35 (from /locations, /catalog or an activity URL)
    //   limit (integer): Rows in one page, 1 to 200 (default 50)
    //   offset (integer): Rows to skip before the page starts (default 0)
    //   undefined (string)
    //   undefined (string)
    //   undefined (string)
    public Task<JsonElement> ActivitiesByLocationAsync(IDictionary<string, object?> parameters, CancellationToken cancellationToken = default) =>
        GetAsync("/activities/{location}", parameters, cancellationToken, "location");

    // Full detail for one activity (as /activity: title, description, images, price,
    // rating, reviews) plus where and how it happens: meeting point with address and
    // coordinates, other start points and a separate end point, pickup, the main
    // attraction (id, name, coordinates, URL) and the places visited with coordinates, the
    // city (id, name, slug) and country, duration with its lower and upper bound in
    // minutes, guide languages and the kind of guide offering them, category and the
    // site's numeric category ids, free cancellation and the cancellation policy, and the
    // activity URL.
    //
    // Each successful request uses 5 credits.
    //
    // Parameters:
    //   id (string, required): numeric activity id, the number after -t in an activity
    //     URL (e.g. 631866)
    //   undefined (string)
    public Task<JsonElement> ActivityV2ByIdAsync(IDictionary<string, object?> parameters, CancellationToken cancellationToken = default) =>
        GetAsync("/activity-v2/{id}", parameters, cancellationToken, "id");

    // Full detail for one activity: title, description, images, starting price, average
    // rating, review count and a sample of recent reviews (author, rating, title, text,
    // date).
    //
    // Each successful request uses 5 credits.
    //
    // Parameters:
    //   id (string, required): numeric activity id, the number after -t in an activity
    //     URL (e.g. 6851)
    //   undefined (string)
    public Task<JsonElement> ActivityByIdAsync(IDictionary<string, object?> parameters, CancellationToken cancellationToken = default) =>
        GetAsync("/activity/{id}", parameters, cancellationToken, "id");

    // Activity URLs listed in one GetYourGuide activity sitemap file (about 5000 per file;
    // URLs whose slugs hold characters other than lowercase letters, digits and hyphens
    // are left out), each with its activity id and place slug.
    //
    // Each successful request uses 5 credits.
    //
    // Parameters:
    //   index (integer): which activity sitemap file to read, 0-based (0 to about 60)
    //   limit (integer): Rows in one page, 1 to 1000 (default 100)
    //   offset (integer): Rows to skip before the page starts (default 0)
    //   undefined (string)
    //   undefined (string)
    //   undefined (string)
    public Task<JsonElement> CatalogAsync(IDictionary<string, object?> parameters, CancellationToken cancellationToken = default) =>
        GetAsync("/catalog", parameters, cancellationToken);

    // A place's tour & activity listings in the site's popularity order (the first page of
    // 24 rows, as /activities), with the top `enrich` listings optionally carrying full
    // detail (description, images, recent reviews) in a `detail` object.
    //
    // Each successful request uses 5 credits.
    //
    // Parameters:
    //   location (string): GetYourGuide place slug, e.g. venice-l35 (from /locations)
    //   detail (string): "true" to add detail to the top listings; "false" for listings
    //     only. One of: true, false
    //   enrich (integer): how many top listings get detail when detail=true (1-5)
    //   limit (integer): Rows in one page, 1 to 200 (default 50)
    //   offset (integer): Rows to skip before the page starts (default 0)
    //   undefined (string)
    //   undefined (string)
    //   undefined (string)
    public Task<JsonElement> ExploreAsync(IDictionary<string, object?> parameters, CancellationToken cancellationToken = default) =>
        GetAsync("/explore", parameters, cancellationToken);

    // Every tour & activity GetYourGuide lists for a place (as /activities-v2: all of the
    // site's pages, `total` = the site's count), with the top `enrich` activities
    // optionally carrying full detail (description, images, recent reviews) in a `detail`
    // object.
    //
    // Each successful request uses 5 credits.
    //
    // Parameters:
    //   location (string): GetYourGuide place slug, e.g. venice-l35 (from /locations)
    //   detail (string): "true" to add detail to the top activities; "false" for
    //     listings only. One of: true, false
    //   enrich (integer): how many top activities get detail when detail=true (1-5)
    //   limit (integer): Rows in one page, 1 to 1000 (default 50)
    //   offset (integer): Rows to skip before the page starts (default 0)
    //   undefined (string)
    //   undefined (string)
    //   undefined (string)
    public Task<JsonElement> ExploreV2Async(IDictionary<string, object?> parameters, CancellationToken cancellationToken = default) =>
        GetAsync("/explore-v2", parameters, cancellationToken);

    // GetYourGuide places (cities, regions, countries, attractions, neighborhoods) whose
    // name matches the text, in the site's relevance order, at most the site's top 20
    // suggestions: id, name, type, descriptor such as 'City in Italy', and the place slug
    // (e.g. venice-l35) that the location parameter of the other endpoints takes.
    //
    // Each successful request uses 5 credits.
    //
    // Parameters:
    //   q (string): name of a city, region, country or attraction (any case, accents
    //     optional)
    //   limit (integer): Rows in one page, 1 to 200 (default 50)
    //   offset (integer): Rows to skip before the page starts (default 0)
    //   undefined (string)
    //   undefined (string)
    //   undefined (string)
    public Task<JsonElement> LocationsAsync(IDictionary<string, object?> parameters, CancellationToken cancellationToken = default) =>
        GetAsync("/locations", parameters, cancellationToken);

    // One page (24 rows) of GetYourGuide's tour & activity search, by free text and/or
    // place, with the site's filters and sort orders. `total` is the site's own count of
    // results for the query; `has_more` says whether page+1 holds more.
    //
    // Each successful request uses 5 credits.
    //
    // Parameters:
    //   q (string): free text as typed in the site's search box (an activity, attraction
    //     or place). Give q, location or both; with neither, the example search for
    //     'gondola' runs
    //   location (string): limit to one place: a place slug from /locations (venice-l35)
    //     or its numeric id (35)
    //   date_from (string): only activities available on or after this date
    //     (YYYY-MM-DD); alone, it searches that one day
    //   date_to (string): last day of the date range (YYYY-MM-DD); needs date_from
    //   min_price (string): lowest starting price, in EUR
    //   max_price (string): highest starting price, in EUR
    //   sort (string): popularity, price_asc, price_desc or rating_desc; with q the text
    //     match is weighed in too. One of: popularity, price_asc, price_desc, rating_desc
    //   languages (string): guide/audio languages, comma separated ISO codes (en, de,
    //     fr, es, it, ...): activities offered in any of them
    //   duration (string): durations, comma separated: 0-3h, 3-5h, 5-7h, full-day,
    //     2-days, 3-days, 4-days, 5-days-plus
    //   min_rating (string): minimum average rating: 3.0, 3.5, 4.0 or 4.5
    //   start_time (string): start times, comma separated: morning (before 12 PM),
    //     afternoon (12-5 PM), evening (after 5 PM)
    //   features (string): comma separated: private, small-group, skip-the-line,
    //     wheelchair-accessible, hotel-pickup, originals
    //   categories (string): category ids, comma separated: the tc<n> in a category page
    //     address (gondola-tours-tc264 -> tc-264 or 264). With several, the rows of each
    //     category are merged and total is the sum of their counts
    //   departs_from (string): departure places, comma separated place slugs or ids from
    //     /locations
    //   page (integer): page of the site's results, 24 per page (1 to 34; the site
    //     serves no pages past about 34). Narrow the query with filters to reach more rows
    //   limit (integer): Rows in one page, 1 to 200 (default 50)
    //   offset (integer): Rows to skip before the page starts (default 0)
    //   undefined (string)
    //   undefined (string)
    //   undefined (string)
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
