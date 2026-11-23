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

    # Tour & activity listings for a GetYourGuide location slug (e.g. venice-l35), each
    # with price, rating, next availability date and destination.
    #
    # Each successful request uses 25 credits.
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
    # Each successful request uses 25 credits.
    #
    # Parameters:
    #   id (string, required): Numeric activity id (the …-t<id> in an activity URL)
    def activity_id(**params)
      get("/activity/{id}", params, %w[id])
    end

    # Enumerate all activity URLs from a GetYourGuide activity sitemap file (?index, ~5000
    # each); each entry has the activity id and location slug.
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
    # Each successful request uses 25 credits.
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
