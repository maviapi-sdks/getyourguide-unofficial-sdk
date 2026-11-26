// Package getyourguide is an unofficial GetYourGuide API client.
//
// Tour & activity listings from GetYourGuide — prices, ratings, availability dates and
// destinations, plus per-activity detail and bulk sitemap discovery.
//
// Not affiliated with GetYourGuide. Endpoint reference: https://maviapi.com/apis/getyourguide
package getyourguide

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"
)

const (
	Version = "0.1.0"
	// DemoKey is the shared demo key a client uses when it is given no key.
	DemoKey = "mvk_test_playground_5f3c1a8d"
)

// Params are an endpoint's parameters by name. Those named in the endpoint's
// path go there, the rest in the query string.
type Params map[string]any

// Error is an error status answered by the API.
type Error struct {
	Status  int
	Code    string
	Message string
}

func (e *Error) Error() string { return fmt.Sprintf("%d %s: %s", e.Status, e.Code, e.Message) }

// Client calls the GetYourGuide API. Its fields may be changed after New.
type Client struct {
	APIKey     string
	BaseURL    string
	HTTPClient *http.Client
}

// New returns a client. With an empty apiKey it uses the MAVIAPI_API_KEY
// environment variable, then the shared demo key.
func New(apiKey string) *Client {
	if apiKey == "" {
		apiKey = os.Getenv("MAVIAPI_API_KEY")
	}
	if apiKey == "" {
		apiKey = DemoKey
	}
	root := os.Getenv("MAVIAPI_BASE_URL")
	if root == "" {
		root = "https://api.maviapi.com"
	}
	return &Client{
		APIKey:     apiKey,
		BaseURL:    strings.TrimRight(root, "/") + "/v1/sites/getyourguide",
		HTTPClient: &http.Client{Timeout: 120 * time.Second},
	}
}

// ActivitiesV2ByLocation: Every tour & activity GetYourGuide lists for a location slug (e.g. venice-l35), all
// pages: price, rating, review count, duration, next availability, image.
// pagination.total matches the site's own count.
//
// Each successful request uses 10 credits for every 24 rows it returns (at least 10
// credits).
//
// Parameters:
//
//   - location (string, required): GetYourGuide place slug in the {city}-l{id} form
//     (from /catalog or an activity URL)
//   - limit (integer): Max activities per page (default 50, max 1000). Every page of
//     the location is fetched once and cached, so any limit/offset is served from the
//     same full list
//   - offset (integer): Activities to skip. Works up to pagination.total (the site's
//     full count), not just the first page
func (c *Client) ActivitiesV2ByLocation(ctx context.Context, params Params) (json.RawMessage, error) {
	return c.get(ctx, "/activities-v2/{location}", params, "location")
}

// ActivitiesByLocation: Tour & activity listings for a GetYourGuide location slug (e.g. venice-l35), each
// with price, rating, next availability date and destination.
//
// Each successful request uses 10 credits.
//
// Parameters:
//
//   - location (string, required): GetYourGuide place slug in the {city}-l{id} form
//     (from /catalog or an activity URL)
//   - limit (integer): Max items per page (default 50, max 200)
//   - offset (integer): Items to skip for pagination
func (c *Client) ActivitiesByLocation(ctx context.Context, params Params) (json.RawMessage, error) {
	return c.get(ctx, "/activities/{location}", params, "location")
}

// ActivityById: Full detail for one activity by numeric id (e.g. 6851): title, description, images,
// price, rating, review count and sample reviews.
//
// Each successful request uses 10 credits.
//
// Parameters:
//
//   - id (string, required): Numeric activity id (the …-t<id> in an activity URL)
func (c *Client) ActivityById(ctx context.Context, params Params) (json.RawMessage, error) {
	return c.get(ctx, "/activity/{id}", params, "id")
}

// Catalog: Enumerate all activity URLs from a GetYourGuide activity sitemap file (?index, ~5000
// each); each entry has the activity id and location slug.
//
// Each successful request uses 1 credit for every 5000 rows it returns (at least 1
// credit).
//
// Parameters:
//
//   - index (integer): Which activity sitemap file to read (0-based)
//   - limit (integer): Max items per page (default 100, max 5000)
//   - offset (integer): Items to skip for pagination
func (c *Client) Catalog(ctx context.Context, params Params) (json.RawMessage, error) {
	return c.get(ctx, "/catalog", params)
}

// Explore: Resolve a location's tour/activity listings and optionally enrich the top N with
// full detail (description, images, reviews) in one call.
//
// Each successful request uses 10 credits.
//
// Parameters:
//
//   - location (string, required): GetYourGuide place slug, e.g. venice-l35
//   - detail (string): When true, enrich the top `enrich` listings with detail
//     (description, images, reviews). One of: true, false
//   - enrich (integer): How many top listings to enrich when detail=true (1-5). One
//     of: 1, 2, 3, 4, 5
//   - limit (integer): Max items per page (default 50, max 200)
//   - offset (integer): Items to skip for pagination
func (c *Client) Explore(ctx context.Context, params Params) (json.RawMessage, error) {
	return c.get(ctx, "/explore", params, "location")
}

// ExploreV2: Every tour/activity GetYourGuide lists for a location (all pages, pagination.total =
// the site's count), optionally with full detail (description, images, reviews) for
// the top N, in one call.
//
// Each successful request uses 10 credits for every 24 rows it returns (at least 10
// credits).
//
// Parameters:
//
//   - location (string, required): GetYourGuide place slug, e.g. venice-l35
//   - detail (string): When true, enrich the top `enrich` activities with detail
//     (description, images, reviews). One of: true, false
//   - enrich (integer): How many top activities to enrich when detail=true (1-5). One
//     of: 1, 2, 3, 4, 5
//   - limit (integer): Max activities per page (default 50, max 1000). Every page of
//     the location is fetched once and cached, so any limit/offset is served from the
//     same full list
//   - offset (integer): Activities to skip. Works up to pagination.total (the site's
//     full count), not just the first page
func (c *Client) ExploreV2(ctx context.Context, params Params) (json.RawMessage, error) {
	return c.get(ctx, "/explore-v2", params, "location")
}

// Locations: Find GetYourGuide places (cities, regions, countries, attractions) by name: id,
// name, type, descriptor (e.g. 'City in Italy') and the place slug (e.g. venice-l35)
// that /activities, /activities-v2, /explore and /search take.
//
// Each successful request uses 10 credits.
//
// Parameters:
//
//   - q (string, required): Name of a city, region, country or attraction (any case,
//     accents optional)
//   - limit (integer): Max places to return (the site suggests up to 20)
//   - offset (integer)
func (c *Client) Locations(ctx context.Context, params Params) (json.RawMessage, error) {
	return c.get(ctx, "/locations", params, "q")
}

// Search: Search GetYourGuide tours & activities by free text and/or place, with the site's
// filters (dates, price range, duration, minimum rating, languages, start time,
// features, categories, departure place) and sort orders. 24 results per page;
// data.total is the site's own count.
//
// Each successful request uses 10 credits for every 24 rows it returns (at least 10
// credits).
//
// Parameters:
//
//   - q (string): Free text, as typed in the site's search box (an activity,
//     attraction or place). q, location or both are required
//   - location (string): Limit to one place: a place slug from /locations (venice-l35)
//     or its numeric id (35)
//   - date_from (string): Only activities available on or after this date
//     (YYYY-MM-DD). Alone, it searches that one day
//   - date_to (string): Last day of the date range (YYYY-MM-DD); needs date_from
//   - min_price (number): Lowest starting price, in EUR
//   - max_price (number): Highest starting price, in EUR
//   - sort (string): Order of the results. With q, the text match is weighed in too.
//     One of: popularity, price_asc, price_desc, rating_desc
//   - languages (string): Guide/audio languages, comma separated ISO codes (en, de,
//     fr, es, it, ...): activities offered in any of them
//   - duration (string): Durations, comma separated: 0-3h, 3-5h, 5-7h, full-day,
//     2-days, 3-days, 4-days, 5-days-plus
//   - min_rating (string): Minimum average rating. One of: 3.0, 3.5, 4.0, 4.5
//   - start_time (string): Start times, comma separated: morning (before 12 PM),
//     afternoon (12-5 PM), evening (after 5 PM)
//   - features (string): Features, comma separated: private, small-group,
//     skip-the-line, wheelchair-accessible, hotel-pickup, originals
//   - categories (string): Category ids, comma separated: the tc<n> in a category page
//     address (gondola-tours-tc264 -> tc-264)
//   - departs_from (string): Departure places, comma separated slugs or ids from
//     /locations
//   - page (integer): Page of the site's results, 24 per page (1 to 34; the site
//     serves no pages past about 34). data.total is the full count; narrow the query
//     with filters to reach more rows
//   - limit (integer): Rows of this page to return (default 50: the whole 24-row page)
//   - offset (integer): Rows of this page to skip
func (c *Client) Search(ctx context.Context, params Params) (json.RawMessage, error) {
	return c.get(ctx, "/search", params)
}

func (c *Client) get(ctx context.Context, path string, params Params, required ...string) (json.RawMessage, error) {
	for _, name := range required {
		if params[name] == nil {
			return nil, fmt.Errorf("missing required parameter: %s", name)
		}
	}
	query := url.Values{}
	for name, value := range params {
		if value == nil {
			continue
		}
		text := fmt.Sprint(value)
		if token := "{" + name + "}"; strings.Contains(path, token) {
			path = strings.ReplaceAll(path, token, url.PathEscape(text))
		} else {
			query.Set(name, text)
		}
	}
	target := c.BaseURL + path
	if len(query) > 0 {
		target += "?" + query.Encode()
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, target, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+c.APIKey)
	req.Header.Set("Accept", "application/json")
	req.Header.Set("User-Agent", "getyourguide-unofficial-sdk/0.1.0 (go)")
	res, err := c.HTTPClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()
	body, err := io.ReadAll(res.Body)
	if err != nil {
		return nil, err
	}
	if res.StatusCode >= 400 {
		failure := &Error{Status: res.StatusCode, Code: "http_error", Message: string(body)}
		var detail struct{ Error, Message string }
		if json.Unmarshal(body, &detail) == nil && detail.Error != "" {
			failure.Code, failure.Message = detail.Error, detail.Message
		}
		return nil, failure
	}
	return body, nil
}
