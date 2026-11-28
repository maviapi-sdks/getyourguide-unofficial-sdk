# frozen_string_literal: true

# Unofficial GetYourGuide API client for Ruby.
# Not affiliated with GetYourGuide. Endpoint reference: https://maviapi.com/apis/getyourguide

require "json"
require "net/http"
require "uri"

module GetyourguideSdk
  VERSION = "0.1.0"
  DEMO_KEY = "mvk_test_playground_5f3c1a8d"

  # An error status answered by the API.
  class ApiError < StandardError
    attr_reader :status, :code

    def initialize(status, code, message)
      super("#{status} #{code}: #{message}")
      @status = status
      @code = code
    end
  end

  class Client
    # With no api_key it uses the MAVIAPI_API_KEY environment variable, then the
    # shared demo key.
    def initialize(api_key: nil, base_url: nil, timeout: 120)
      given = ->(*values) { values.find { |value| value && !value.empty? } }
      @api_key = given.call(api_key, ENV["MAVIAPI_API_KEY"], DEMO_KEY)
      root = given.call(base_url, ENV["MAVIAPI_BASE_URL"], "https://api.maviapi.com")
      @base_url = root.sub(%r{/+\z}, "") + "/v1/sites/getyourguide"
      @timeout = timeout
    end

    # Every tour & activity GetYourGuide lists for a place, across all of the site's
    # pages: price, rating, review count, duration, next availability, image. `total` is
    # the site's own count; rows come in the site's popularity order, then the remaining
    # activities by ascending price.
    #
    # Each successful request uses 5 credits.
    #
    # Parameters:
    #   location (string, required): GetYourGuide place slug in the {city}-l{id} form,
    #     e.g. venice-l35 (from /locations, /catalog or an activity URL)
    #   limit (integer): Rows in one page, 1 to 1000 (default 50)
    #   offset (integer): Rows to skip before the page starts (default 0)
    #   undefined (string)
    #   undefined (string)
    #   undefined (string)
    def activities_v2_by_location(**params)
      get("/activities-v2/{location}", params, %w[location])
    end

    # Tour & activity listings for a GetYourGuide place in the site's popularity order:
    # the first page of the site's listing (24 rows), each with price, rating, review
    # count, next availability, place label and image.
    #
    # Each successful request uses 5 credits.
    #
    # Parameters:
    #   location (string, required): GetYourGuide place slug in the {city}-l{id} form,
    #     e.g. venice-l35 (from /locations, /catalog or an activity URL)
    #   limit (integer): Rows in one page, 1 to 200 (default 50)
    #   offset (integer): Rows to skip before the page starts (default 0)
    #   undefined (string)
    #   undefined (string)
    #   undefined (string)
    def activities_by_location(**params)
      get("/activities/{location}", params, %w[location])
    end

    # Full detail for one activity (as /activity: title, description, images, price,
    # rating, reviews) plus where and how it happens: meeting point with address and
    # coordinates, other start points and a separate end point, pickup, the main
    # attraction (id, name, coordinates, URL) and the places visited with coordinates, the
    # city (id, name, slug) and country, duration with its lower and upper bound in
    # minutes, guide languages and the kind of guide offering them, category and the
    # site's numeric category ids, free cancellation and the cancellation policy, and the
    # activity URL.
    #
    # Each successful request uses 5 credits.
    #
    # Parameters:
    #   id (string, required): numeric activity id, the number after -t in an activity
    #     URL (e.g. 631866)
    #   undefined (string)
    def activity_v2_by_id(**params)
      get("/activity-v2/{id}", params, %w[id])
    end

    # Full detail for one activity: title, description, images, starting price, average
    # rating, review count and a sample of recent reviews (author, rating, title, text,
    # date).
    #
    # Each successful request uses 5 credits.
    #
    # Parameters:
    #   id (string, required): numeric activity id, the number after -t in an activity
    #     URL (e.g. 6851)
    #   undefined (string)
    def activity_by_id(**params)
      get("/activity/{id}", params, %w[id])
    end

    # Activity URLs listed in one GetYourGuide activity sitemap file (about 5000 per file;
    # URLs whose slugs hold characters other than lowercase letters, digits and hyphens
    # are left out), each with its activity id and place slug.
    #
    # Each successful request uses 5 credits.
    #
    # Parameters:
    #   index (integer): which activity sitemap file to read, 0-based (0 to about 60)
    #   limit (integer): Rows in one page, 1 to 1000 (default 100)
    #   offset (integer): Rows to skip before the page starts (default 0)
    #   undefined (string)
    #   undefined (string)
    #   undefined (string)
    def catalog(**params)
      get("/catalog", params, %w[])
    end

    # A place's tour & activity listings in the site's popularity order (the first page of
    # 24 rows, as /activities), with the top `enrich` listings optionally carrying full
    # detail (description, images, recent reviews) in a `detail` object.
    #
    # Each successful request uses 5 credits.
    #
    # Parameters:
    #   location (string): GetYourGuide place slug, e.g. venice-l35 (from /locations)
    #   detail (string): "true" to add detail to the top listings; "false" for listings
    #     only. One of: true, false
    #   enrich (integer): how many top listings get detail when detail=true (1-5)
    #   limit (integer): Rows in one page, 1 to 200 (default 50)
    #   offset (integer): Rows to skip before the page starts (default 0)
    #   undefined (string)
    #   undefined (string)
    #   undefined (string)
    def explore(**params)
      get("/explore", params, %w[])
    end

    # Every tour & activity GetYourGuide lists for a place (as /activities-v2: all of the
    # site's pages, `total` = the site's count), with the top `enrich` activities
    # optionally carrying full detail (description, images, recent reviews) in a `detail`
    # object.
    #
    # Each successful request uses 5 credits.
    #
    # Parameters:
    #   location (string): GetYourGuide place slug, e.g. venice-l35 (from /locations)
    #   detail (string): "true" to add detail to the top activities; "false" for
    #     listings only. One of: true, false
    #   enrich (integer): how many top activities get detail when detail=true (1-5)
    #   limit (integer): Rows in one page, 1 to 1000 (default 50)
    #   offset (integer): Rows to skip before the page starts (default 0)
    #   undefined (string)
    #   undefined (string)
    #   undefined (string)
    def explore_v2(**params)
      get("/explore-v2", params, %w[])
    end

    # GetYourGuide places (cities, regions, countries, attractions, neighborhoods) whose
    # name matches the text, in the site's relevance order, at most the site's top 20
    # suggestions: id, name, type, descriptor such as 'City in Italy', and the place slug
    # (e.g. venice-l35) that the location parameter of the other endpoints takes.
    #
    # Each successful request uses 5 credits.
    #
    # Parameters:
    #   q (string): name of a city, region, country or attraction (any case, accents
    #     optional)
    #   limit (integer): Rows in one page, 1 to 200 (default 50)
    #   offset (integer): Rows to skip before the page starts (default 0)
    #   undefined (string)
    #   undefined (string)
    #   undefined (string)
    def locations(**params)
      get("/locations", params, %w[])
    end

    # One page (24 rows) of GetYourGuide's tour & activity search, by free text and/or
    # place, with the site's filters and sort orders. `total` is the site's own count of
    # results for the query; `has_more` says whether page+1 holds more.
    #
    # Each successful request uses 5 credits.
    #
    # Parameters:
    #   q (string): free text as typed in the site's search box (an activity, attraction
    #     or place). Give q, location or both; with neither, the example search for
    #     'gondola' runs
    #   location (string): limit to one place: a place slug from /locations (venice-l35)
    #     or its numeric id (35)
    #   date_from (string): only activities available on or after this date
    #     (YYYY-MM-DD); alone, it searches that one day
    #   date_to (string): last day of the date range (YYYY-MM-DD); needs date_from
    #   min_price (string): lowest starting price, in EUR
    #   max_price (string): highest starting price, in EUR
    #   sort (string): popularity, price_asc, price_desc or rating_desc; with q the text
    #     match is weighed in too. One of: popularity, price_asc, price_desc, rating_desc
    #   languages (string): guide/audio languages, comma separated ISO codes (en, de,
    #     fr, es, it, ...): activities offered in any of them
    #   duration (string): durations, comma separated: 0-3h, 3-5h, 5-7h, full-day,
    #     2-days, 3-days, 4-days, 5-days-plus
    #   min_rating (string): minimum average rating: 3.0, 3.5, 4.0 or 4.5
    #   start_time (string): start times, comma separated: morning (before 12 PM),
    #     afternoon (12-5 PM), evening (after 5 PM)
    #   features (string): comma separated: private, small-group, skip-the-line,
    #     wheelchair-accessible, hotel-pickup, originals
    #   categories (string): category ids, comma separated: the tc<n> in a category page
    #     address (gondola-tours-tc264 -> tc-264 or 264). With several, the rows of each
    #     category are merged and total is the sum of their counts
    #   departs_from (string): departure places, comma separated place slugs or ids from
    #     /locations
    #   page (integer): page of the site's results, 24 per page (1 to 34; the site
    #     serves no pages past about 34). Narrow the query with filters to reach more rows
    #   limit (integer): Rows in one page, 1 to 200 (default 50)
    #   offset (integer): Rows to skip before the page starts (default 0)
    #   undefined (string)
    #   undefined (string)
    #   undefined (string)
    def search(**params)
      get("/search", params, %w[])
    end

    private

    def get(path, params, required)
      params = params.transform_keys(&:to_s)
      missing = required.find { |name| params[name].nil? }
      raise ArgumentError, "missing required parameter: #{missing}" if missing

      query = {}
      params.each do |name, value|
        next if value.nil?

        token = "{#{name}}"
        if path.include?(token)
          path = path.sub(token, URI.encode_www_form_component(value.to_s).gsub("+", "%20"))
        else
          query[name] = value.to_s
        end
      end
      uri = URI(@base_url + path)
      uri.query = URI.encode_www_form(query) unless query.empty?
      request = Net::HTTP::Get.new(uri)
      request["Authorization"] = "Bearer #{@api_key}"
      request["Accept"] = "application/json"
      request["User-Agent"] = "getyourguide-unofficial-sdk/0.1.0 (ruby)"
      response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: uri.scheme == "https", read_timeout: @timeout) do |http|
        http.request(request)
      end
      data = begin
        JSON.parse(response.body.to_s)
      rescue JSON::ParserError
        nil
      end
      return data if response.is_a?(Net::HTTPSuccess)

      detail = data.is_a?(Hash) ? data : {}
      raise ApiError.new(response.code.to_i, detail["error"] || "http_error", detail["message"] || response.body.to_s[0, 200])
    end
  end
end
