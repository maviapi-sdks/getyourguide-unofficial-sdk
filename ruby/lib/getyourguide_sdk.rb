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

    # Every tour & activity GetYourGuide lists for a location slug (e.g. venice-l35), all
    # pages: price, rating, review count, duration, next availability, image.
    # pagination.total matches the site's own count.
    #
    # Each successful request uses 10 credits for every 24 rows it returns (at least 10
    # credits).
    #
    # Parameters:
    #   location (string, required): GetYourGuide place slug in the {city}-l{id} form
    #     (from /catalog or an activity URL)
    #   limit (integer): Max activities per page (default 50, max 1000). Every page of
    #     the location is fetched once and cached, so any limit/offset is served from the
    #     same full list
    #   offset (integer): Activities to skip. Works up to pagination.total (the site's
    #     full count), not just the first page
    def activities_v2_location(**params)
      get("/activities-v2/{location}", params, %w[location])
    end

    # Tour & activity listings for a GetYourGuide location slug (e.g. venice-l35), each
    # with price, rating, next availability date and destination.
    #
    # Each successful request uses 10 credits.
    #
    # Parameters:
    #   location (string, required): GetYourGuide place slug in the {city}-l{id} form
    #     (from /catalog or an activity URL)
    #   limit (integer): Max items per page (default 50, max 200)
    #   offset (integer): Items to skip for pagination
    def activities_location(**params)
      get("/activities/{location}", params, %w[location])
    end

    # Full detail for one activity by numeric id (e.g. 6851): title, description, images,
    # price, rating, review count and sample reviews.
    #
    # Each successful request uses 10 credits.
    #
    # Parameters:
    #   id (string, required): Numeric activity id (the …-t<id> in an activity URL)
    def activity_id(**params)
      get("/activity/{id}", params, %w[id])
    end

    # Enumerate all activity URLs from a GetYourGuide activity sitemap file (?index, ~5000
    # each); each entry has the activity id and location slug.
    #
    # Each successful request uses 1 credit for every 5000 rows it returns (at least 1
    # credit).
    #
    # Parameters:
    #   index (integer): Which activity sitemap file to read (0-based)
    #   limit (integer): Max items per page (default 100, max 5000)
    #   offset (integer): Items to skip for pagination
    def catalog(**params)
      get("/catalog", params, %w[])
    end

    # Resolve a location's tour/activity listings and optionally enrich the top N with
    # full detail (description, images, reviews) in one call.
    #
    # Each successful request uses 10 credits.
    #
    # Parameters:
    #   location (string, required): GetYourGuide place slug, e.g. venice-l35
    #   detail (string): When true, enrich the top `enrich` listings with detail
    #     (description, images, reviews). One of: true, false
    #   enrich (integer): How many top listings to enrich when detail=true (1-5). One
    #     of: 1, 2, 3, 4, 5
    #   limit (integer): Max items per page (default 50, max 200)
    #   offset (integer): Items to skip for pagination
    def explore(**params)
      get("/explore", params, %w[location])
    end

    # Every tour/activity GetYourGuide lists for a location (all pages, pagination.total =
    # the site's count), optionally with full detail (description, images, reviews) for
    # the top N, in one call.
    #
    # Each successful request uses 10 credits for every 24 rows it returns (at least 10
    # credits).
    #
    # Parameters:
    #   location (string, required): GetYourGuide place slug, e.g. venice-l35
    #   detail (string): When true, enrich the top `enrich` activities with detail
    #     (description, images, reviews). One of: true, false
    #   enrich (integer): How many top activities to enrich when detail=true (1-5). One
    #     of: 1, 2, 3, 4, 5
    #   limit (integer): Max activities per page (default 50, max 1000). Every page of
    #     the location is fetched once and cached, so any limit/offset is served from the
    #     same full list
    #   offset (integer): Activities to skip. Works up to pagination.total (the site's
    #     full count), not just the first page
    def explore_v2(**params)
      get("/explore-v2", params, %w[location])
    end

    # Find GetYourGuide places (cities, regions, countries, attractions) by name: id,
    # name, type, descriptor (e.g. 'City in Italy') and the place slug (e.g. venice-l35)
    # that /activities, /activities-v2, /explore and /search take.
    #
    # Each successful request uses 10 credits.
    #
    # Parameters:
    #   q (string, required): Name of a city, region, country or attraction (any case,
    #     accents optional)
    #   limit (integer): Max places to return (the site suggests up to 20)
    #   offset (integer)
    def locations(**params)
      get("/locations", params, %w[q])
    end

    # Search GetYourGuide tours & activities by free text and/or place, with the site's
    # filters (dates, price range, duration, minimum rating, languages, start time,
    # features, categories, departure place) and sort orders. 24 results per page;
    # data.total is the site's own count.
    #
    # Each successful request uses 10 credits for every 24 rows it returns (at least 10
    # credits).
    #
    # Parameters:
    #   q (string): Free text, as typed in the site's search box (an activity,
    #     attraction or place). q, location or both are required
    #   location (string): Limit to one place: a place slug from /locations (venice-l35)
    #     or its numeric id (35)
    #   date_from (string): Only activities available on or after this date
    #     (YYYY-MM-DD). Alone, it searches that one day
    #   date_to (string): Last day of the date range (YYYY-MM-DD); needs date_from
    #   min_price (number): Lowest starting price, in EUR
    #   max_price (number): Highest starting price, in EUR
    #   sort (string): Order of the results. With q, the text match is weighed in too.
    #     One of: popularity, price_asc, price_desc, rating_desc
    #   languages (string): Guide/audio languages, comma separated ISO codes (en, de,
    #     fr, es, it, ...): activities offered in any of them
    #   duration (string): Durations, comma separated: 0-3h, 3-5h, 5-7h, full-day,
    #     2-days, 3-days, 4-days, 5-days-plus
    #   min_rating (string): Minimum average rating. One of: 3.0, 3.5, 4.0, 4.5
    #   start_time (string): Start times, comma separated: morning (before 12 PM),
    #     afternoon (12-5 PM), evening (after 5 PM)
    #   features (string): Features, comma separated: private, small-group,
    #     skip-the-line, wheelchair-accessible, hotel-pickup, originals
    #   categories (string): Category ids, comma separated: the tc<n> in a category page
    #     address (gondola-tours-tc264 -> tc-264)
    #   departs_from (string): Departure places, comma separated slugs or ids from
    #     /locations
    #   page (integer): Page of the site's results, 24 per page (1 to 34; the site
    #     serves no pages past about 34). data.total is the full count; narrow the query
    #     with filters to reach more rows
    #   limit (integer): Rows of this page to return (default 50: the whole 24-row page)
    #   offset (integer): Rows of this page to skip
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
