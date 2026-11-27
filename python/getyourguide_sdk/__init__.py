"""Unofficial GetYourGuide API client for Python.

Tour & activity listings from GetYourGuide — prices, ratings, availability dates and destinations, plus per-activity detail and bulk sitemap discovery.

Not affiliated with GetYourGuide. Endpoint reference: https://maviapi.com/apis/getyourguide
"""

from __future__ import annotations

import json
import os
import urllib.error
import urllib.parse
import urllib.request
from typing import Any, Dict, Optional

__version__ = "0.1.0"
__all__ = ["GetyourguideClient", "ApiError", "DEMO_KEY"]

DEMO_KEY = "mvk_test_playground_5f3c1a8d"


class ApiError(Exception):
    """An error status answered by the API."""

    def __init__(self, status: int, code: str, message: str) -> None:
        super().__init__(f"{status} {code}: {message}")
        self.status = status
        self.code = code
        self.message = message


class GetyourguideClient:
    """GetYourGuide API client.

    With no api_key it uses the MAVIAPI_API_KEY environment variable, then the
    shared demo key.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        *,
        base_url: Optional[str] = None,
        timeout: float = 120.0,
    ) -> None:
        self.api_key = api_key or os.environ.get("MAVIAPI_API_KEY") or DEMO_KEY
        root = base_url or os.environ.get("MAVIAPI_BASE_URL") or "https://api.maviapi.com"
        self.base_url = root.rstrip("/") + "/v1/sites/getyourguide"
        self.timeout = timeout

    def activities_v2_by_location(self, *, location: str, limit: Optional[int] = None, offset: Optional[int] = None) -> Dict[str, Any]:
        """
        Every tour & activity GetYourGuide lists for a location slug (e.g. venice-l35), all
        pages: price, rating, review count, duration, next availability, image.
        pagination.total matches the site's own count.

        Each successful request uses 10 credits for every 24 rows it returns (at least 10
        credits).

        Parameters:
          location (string, required): GetYourGuide place slug in the {city}-l{id} form
            (from /catalog or an activity URL)
          limit (integer): Max activities per page (default 50, max 1000). Every page of
            the location is fetched once and cached, so any limit/offset is served from the
            same full list
          offset (integer): Activities to skip. Works up to pagination.total (the site's
            full count), not just the first page
        """
        return self._get("/activities-v2/{location}", {"location": location, "limit": limit, "offset": offset})

    def activities_by_location(self, *, location: str, limit: Optional[int] = None, offset: Optional[int] = None) -> Dict[str, Any]:
        """
        Tour & activity listings for a GetYourGuide location slug (e.g. venice-l35), each
        with price, rating, next availability date and destination.

        Each successful request uses 10 credits.

        Parameters:
          location (string, required): GetYourGuide place slug in the {city}-l{id} form
            (from /catalog or an activity URL)
          limit (integer): Max items per page (default 50, max 200)
          offset (integer): Items to skip for pagination
        """
        return self._get("/activities/{location}", {"location": location, "limit": limit, "offset": offset})

    def activity_v2_by_id(self, *, id: str) -> Dict[str, Any]:
        """
        Full detail for one activity by numeric id (e.g. 6851), as /activity/{id}, plus
        where it happens: meeting point (name, address, coordinates), other start and end
        points, the main attraction and stops with coordinates, city slug and id, duration
        in minutes, languages, category, free cancellation and the activity url.

        Each successful request uses 10 credits.

        Parameters:
          id (string, required): Numeric activity id (the …-t<id> in an activity URL)
        """
        return self._get("/activity-v2/{id}", {"id": id})

    def activity_by_id(self, *, id: str) -> Dict[str, Any]:
        """
        Full detail for one activity by numeric id (e.g. 6851): title, description, images,
        price, rating, review count and sample reviews.

        Each successful request uses 10 credits.

        Parameters:
          id (string, required): Numeric activity id (the …-t<id> in an activity URL)
        """
        return self._get("/activity/{id}", {"id": id})

    def catalog(self, *, index: Optional[int] = None, limit: Optional[int] = None, offset: Optional[int] = None) -> Dict[str, Any]:
        """
        Enumerate all activity URLs from a GetYourGuide activity sitemap file (?index, ~5000
        each); each entry has the activity id and location slug.

        Each successful request uses 1 credit for every 5000 rows it returns (at least 1
        credit).

        Parameters:
          index (integer): Which activity sitemap file to read (0-based)
          limit (integer): Max items per page (default 100, max 5000)
          offset (integer): Items to skip for pagination
        """
        return self._get("/catalog", {"index": index, "limit": limit, "offset": offset})

    def explore(self, *, location: str, detail: Optional[str] = None, enrich: Optional[int] = None, limit: Optional[int] = None, offset: Optional[int] = None) -> Dict[str, Any]:
        """
        Resolve a location's tour/activity listings and optionally enrich the top N with
        full detail (description, images, reviews) in one call.

        Each successful request uses 10 credits.

        Parameters:
          location (string, required): GetYourGuide place slug, e.g. venice-l35
          detail (string): When true, enrich the top `enrich` listings with detail
            (description, images, reviews). One of: true, false
          enrich (integer): How many top listings to enrich when detail=true (1-5). One
            of: 1, 2, 3, 4, 5
          limit (integer): Max items per page (default 50, max 200)
          offset (integer): Items to skip for pagination
        """
        return self._get("/explore", {"location": location, "detail": detail, "enrich": enrich, "limit": limit, "offset": offset})

    def explore_v2(self, *, location: str, detail: Optional[str] = None, enrich: Optional[int] = None, limit: Optional[int] = None, offset: Optional[int] = None) -> Dict[str, Any]:
        """
        Every tour/activity GetYourGuide lists for a location (all pages, pagination.total =
        the site's count), optionally with full detail (description, images, reviews) for
        the top N, in one call.

        Each successful request uses 10 credits for every 24 rows it returns (at least 10
        credits).

        Parameters:
          location (string, required): GetYourGuide place slug, e.g. venice-l35
          detail (string): When true, enrich the top `enrich` activities with detail
            (description, images, reviews). One of: true, false
          enrich (integer): How many top activities to enrich when detail=true (1-5). One
            of: 1, 2, 3, 4, 5
          limit (integer): Max activities per page (default 50, max 1000). Every page of
            the location is fetched once and cached, so any limit/offset is served from the
            same full list
          offset (integer): Activities to skip. Works up to pagination.total (the site's
            full count), not just the first page
        """
        return self._get("/explore-v2", {"location": location, "detail": detail, "enrich": enrich, "limit": limit, "offset": offset})

    def locations(self, *, q: str, limit: Optional[int] = None, offset: Optional[int] = None) -> Dict[str, Any]:
        """
        Find GetYourGuide places (cities, regions, countries, attractions) by name: id,
        name, type, descriptor (e.g. 'City in Italy') and the place slug (e.g. venice-l35)
        that /activities, /activities-v2, /explore and /search take.

        Each successful request uses 10 credits.

        Parameters:
          q (string, required): Name of a city, region, country or attraction (any case,
            accents optional)
          limit (integer): Max places to return (the site suggests up to 20)
          offset (integer)
        """
        return self._get("/locations", {"q": q, "limit": limit, "offset": offset})

    def search(self, *, q: Optional[str] = None, location: Optional[str] = None, date_from: Optional[str] = None, date_to: Optional[str] = None, min_price: Optional[float] = None, max_price: Optional[float] = None, sort: Optional[str] = None, languages: Optional[str] = None, duration: Optional[str] = None, min_rating: Optional[str] = None, start_time: Optional[str] = None, features: Optional[str] = None, categories: Optional[str] = None, departs_from: Optional[str] = None, page: Optional[int] = None, limit: Optional[int] = None, offset: Optional[int] = None) -> Dict[str, Any]:
        """
        Search GetYourGuide tours & activities by free text and/or place, with the site's
        filters (dates, price range, duration, minimum rating, languages, start time,
        features, categories, departure place) and sort orders. 24 results per page;
        data.total is the site's own count.

        Each successful request uses 10 credits for every 24 rows it returns (at least 10
        credits).

        Parameters:
          q (string): Free text, as typed in the site's search box (an activity,
            attraction or place). q, location or both are required
          location (string): Limit to one place: a place slug from /locations (venice-l35)
            or its numeric id (35)
          date_from (string): Only activities available on or after this date
            (YYYY-MM-DD). Alone, it searches that one day
          date_to (string): Last day of the date range (YYYY-MM-DD); needs date_from
          min_price (number): Lowest starting price, in EUR
          max_price (number): Highest starting price, in EUR
          sort (string): Order of the results. With q, the text match is weighed in too.
            One of: popularity, price_asc, price_desc, rating_desc
          languages (string): Guide/audio languages, comma separated ISO codes (en, de,
            fr, es, it, ...): activities offered in any of them
          duration (string): Durations, comma separated: 0-3h, 3-5h, 5-7h, full-day,
            2-days, 3-days, 4-days, 5-days-plus
          min_rating (string): Minimum average rating. One of: 3.0, 3.5, 4.0, 4.5
          start_time (string): Start times, comma separated: morning (before 12 PM),
            afternoon (12-5 PM), evening (after 5 PM)
          features (string): Features, comma separated: private, small-group,
            skip-the-line, wheelchair-accessible, hotel-pickup, originals
          categories (string): Category ids, comma separated: the tc<n> in a category page
            address (gondola-tours-tc264 -> tc-264)
          departs_from (string): Departure places, comma separated slugs or ids from
            /locations
          page (integer): Page of the site's results, 24 per page (1 to 34; the site
            serves no pages past about 34). data.total is the full count; narrow the query
            with filters to reach more rows
          limit (integer): Rows of this page to return (default 50: the whole 24-row page)
          offset (integer): Rows of this page to skip
        """
        return self._get("/search", {"q": q, "location": location, "date_from": date_from, "date_to": date_to, "min_price": min_price, "max_price": max_price, "sort": sort, "languages": languages, "duration": duration, "min_rating": min_rating, "start_time": start_time, "features": features, "categories": categories, "departs_from": departs_from, "page": page, "limit": limit, "offset": offset})

    def _get(self, path: str, params: Dict[str, Any]) -> Dict[str, Any]:
        query = {}
        for name, value in params.items():
            if value is None:
                continue
            text = str(value).lower() if isinstance(value, bool) else str(value)
            token = "{" + name + "}"
            if token in path:
                path = path.replace(token, urllib.parse.quote(text, safe=""))
            else:
                query[name] = text
        url = self.base_url + path + ("?" + urllib.parse.urlencode(query) if query else "")
        request = urllib.request.Request(
            url,
            headers={
                "Authorization": "Bearer " + self.api_key,
                "Accept": "application/json",
                "User-Agent": "getyourguide-unofficial-sdk/0.1.0 (python)",
            },
        )
        try:
            with urllib.request.urlopen(request, timeout=self.timeout) as response:
                return json.loads(response.read())
        except urllib.error.HTTPError as error:
            body = error.read().decode("utf-8", "replace")
            try:
                detail = json.loads(body)
            except ValueError:
                detail = None
            if not isinstance(detail, dict):
                detail = {}
            raise ApiError(
                error.code,
                str(detail.get("error", "http_error")),
                str(detail.get("message", body[:200])),
            ) from None
