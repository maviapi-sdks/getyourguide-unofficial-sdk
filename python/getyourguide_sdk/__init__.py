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

    def activities_location(self, *, location: str, limit: Optional[int] = None, offset: Optional[int] = None) -> Dict[str, Any]:
        """
        Tour & activity listings for a GetYourGuide location slug (e.g. venice-l35), each
        with price, rating, next availability date and destination.

        Each successful request uses 25 credits.

        Parameters:
          location (string, required): GetYourGuide place slug in the {city}-l{id} form
            (from /catalog or an activity URL)
          limit (integer): Max items per page (default 50, max 200)
          offset (integer): Items to skip for pagination
        """
        return self._get("/activities/{location}", {"location": location, "limit": limit, "offset": offset})

    def activity_id(self, *, id: str) -> Dict[str, Any]:
        """
        Full detail for one activity by numeric id (e.g. 6851): title, description, images,
        price, rating, review count and sample reviews.

        Each successful request uses 25 credits.

        Parameters:
          id (string, required): Numeric activity id (the …-t<id> in an activity URL)
        """
        return self._get("/activity/{id}", {"id": id})

    def catalog(self, *, index: Optional[int] = None, limit: Optional[int] = None, offset: Optional[int] = None) -> Dict[str, Any]:
        """
        Enumerate all activity URLs from a GetYourGuide activity sitemap file (?index, ~5000
        each); each entry has the activity id and location slug.

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

        Each successful request uses 25 credits.

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
