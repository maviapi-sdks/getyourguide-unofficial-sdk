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

    // Tour & activity listings for a GetYourGuide location slug (e.g. venice-l35), each
    // with price, rating, next availability date and destination.
    //
    // Each successful request uses 25 credits.
    //
    // Parameters:
    //   location (string, required): GetYourGuide place slug in the {city}-l{id} form
    //     (from /catalog or an activity URL)
    //   limit (integer): Max items per page (default 50, max 200)
    //   offset (integer): Items to skip for pagination
    public Task<JsonElement> ActivitiesLocationAsync(IDictionary<string, object?> parameters, CancellationToken cancellationToken = default) =>
        GetAsync("/activities/{location}", parameters, cancellationToken, "location");

    // Full detail for one activity by numeric id (e.g. 6851): title, description, images,
    // price, rating, review count and sample reviews.
    //
    // Each successful request uses 25 credits.
    //
    // Parameters:
    //   id (string, required): Numeric activity id (the …-t<id> in an activity URL)
    public Task<JsonElement> ActivityIdAsync(IDictionary<string, object?> parameters, CancellationToken cancellationToken = default) =>
        GetAsync("/activity/{id}", parameters, cancellationToken, "id");

    // Enumerate all activity URLs from a GetYourGuide activity sitemap file (?index, ~5000
    // each); each entry has the activity id and location slug.
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
    // Each successful request uses 25 credits.
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
