// Unofficial GetYourGuide API client for Java 11+.
// Not affiliated with GetYourGuide. Endpoint reference: https://maviapi.com/apis/getyourguide

package com.maviapi.getyourguide;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Map;

/** GetYourGuide API client. Every method returns the response body: a JSON document. */
public class GetyourguideClient {
    public static final String DEMO_KEY = "mvk_test_playground_5f3c1a8d";

    /** An error status answered by the API. Its body is a JSON object with "error" and "message". */
    public static class ApiError extends RuntimeException {
        private final int status;
        private final String body;

        public ApiError(int status, String body) {
            super(status + ": " + body);
            this.status = status;
            this.body = body;
        }

        public int getStatus() {
            return status;
        }

        public String getBody() {
            return body;
        }
    }

    private final String apiKey;
    private final String baseUrl;
    private final HttpClient http = HttpClient.newHttpClient();

    /** Uses the MAVIAPI_API_KEY environment variable, then the shared demo key. */
    public GetyourguideClient() {
        this(null, null);
    }

    public GetyourguideClient(String apiKey) {
        this(apiKey, null);
    }

    public GetyourguideClient(String apiKey, String baseUrl) {
        this.apiKey = first(apiKey, System.getenv("MAVIAPI_API_KEY"), DEMO_KEY);
        String root = first(baseUrl, System.getenv("MAVIAPI_BASE_URL"), "https://api.maviapi.com");
        while (root.endsWith("/")) {
            root = root.substring(0, root.length() - 1);
        }
        this.baseUrl = root + "/v1/sites/getyourguide";
    }

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
    public String activitiesLocation(Map<String, Object> params) {
        return get("/activities/{location}", params, "location");
    }

    /**
     * Full detail for one activity by numeric id (e.g. 6851): title, description, images,
     * price, rating, review count and sample reviews.
     *
     * Each successful request uses 25 credits.
     *
     * Parameters:
     *   id (string, required): Numeric activity id (the …-t<id> in an activity URL)
     */
    public String activityId(Map<String, Object> params) {
        return get("/activity/{id}", params, "id");
    }

    /**
     * Enumerate all activity URLs from a GetYourGuide activity sitemap file (?index, ~5000
     * each); each entry has the activity id and location slug.
     *
     * Parameters:
     *   index (integer): Which activity sitemap file to read (0-based)
     *   limit (integer): Max items per page (default 100, max 5000)
     *   offset (integer): Items to skip for pagination
     */
    public String catalog(Map<String, Object> params) {
        return get("/catalog", params);
    }

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
    public String explore(Map<String, Object> params) {
        return get("/explore", params, "location");
    }

    private static String first(String... values) {
        for (String value : values) {
            if (value != null && !value.isEmpty()) {
                return value;
            }
        }
        return "";
    }

    private String get(String path, Map<String, Object> params, String... required) {
        for (String name : required) {
            if (params.get(name) == null) {
                throw new IllegalArgumentException("Missing required parameter: " + name);
            }
        }
        StringBuilder query = new StringBuilder();
        for (Map.Entry<String, Object> entry : params.entrySet()) {
            if (entry.getValue() == null) {
                continue;
            }
            String token = "{" + entry.getKey() + "}";
            String text = URLEncoder.encode(String.valueOf(entry.getValue()), StandardCharsets.UTF_8);
            if (path.contains(token)) {
                path = path.replace(token, text.replace("+", "%20"));
            } else {
                query.append(query.length() == 0 ? "?" : "&")
                    .append(URLEncoder.encode(entry.getKey(), StandardCharsets.UTF_8))
                    .append("=")
                    .append(text);
            }
        }
        HttpRequest request = HttpRequest.newBuilder(URI.create(baseUrl + path + query))
            .timeout(Duration.ofSeconds(120))
            .header("Authorization", "Bearer " + apiKey)
            .header("Accept", "application/json")
            .header("User-Agent", "getyourguide-unofficial-sdk/0.1.0 (java)")
            .GET()
            .build();
        try {
            HttpResponse<String> response = http.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 400) {
                throw new ApiError(response.statusCode(), response.body());
            }
            return response.body();
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException(e);
        }
    }
}
