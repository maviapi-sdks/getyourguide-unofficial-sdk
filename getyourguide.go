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

// ActivitiesLocation: Tour & activity listings for a GetYourGuide location slug (e.g. venice-l35), each
// with price, rating, next availability date and destination.
//
// Each successful request uses 25 credits.
//
// Parameters:
//
//   - location (string, required): GetYourGuide place slug in the {city}-l{id} form
//     (from /catalog or an activity URL)
//   - limit (integer): Max items per page (default 50, max 200)
//   - offset (integer): Items to skip for pagination
func (c *Client) ActivitiesLocation(ctx context.Context, params Params) (json.RawMessage, error) {
	return c.get(ctx, "/activities/{location}", params, "location")
}

// ActivityId: Full detail for one activity by numeric id (e.g. 6851): title, description, images,
// price, rating, review count and sample reviews.
//
// Each successful request uses 25 credits.
//
// Parameters:
//
//   - id (string, required): Numeric activity id (the …-t<id> in an activity URL)
func (c *Client) ActivityId(ctx context.Context, params Params) (json.RawMessage, error) {
	return c.get(ctx, "/activity/{id}", params, "id")
}

// Catalog: Enumerate all activity URLs from a GetYourGuide activity sitemap file (?index, ~5000
// each); each entry has the activity id and location slug.
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
// Each successful request uses 25 credits.
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
