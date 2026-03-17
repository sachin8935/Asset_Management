from __future__ import annotations

from dataclasses import dataclass

from flask import current_app, request


class APIError(Exception):
    def __init__(self, message: str, status_code: int = 400):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


@dataclass
class PaginationParams:
    page: int
    per_page: int


def parse_pagination_params() -> PaginationParams:
    page = request.args.get("page", default=1, type=int)
    per_page = request.args.get("per_page", default=10, type=int)

    if page is None or page < 1:
        raise APIError("page must be a positive integer", 400)

    if per_page is None or per_page < 1:
        raise APIError("per_page must be a positive integer", 400)

    max_per_page = int(current_app.config.get("MAX_PER_PAGE", 100))
    if per_page > max_per_page:
        per_page = max_per_page

    return PaginationParams(page=page, per_page=per_page)


def pagination_response(payload_key: str, items: list, pagination_obj) -> dict:
    return {
        payload_key: items,
        "pagination": {
            "page": pagination_obj.page,
            "per_page": pagination_obj.per_page,
            "total": pagination_obj.total,
            "pages": pagination_obj.pages,
            "has_next": pagination_obj.has_next,
            "has_prev": pagination_obj.has_prev,
        },
    }


def require_non_empty_string(payload: dict, field: str, *, max_length: int | None = None) -> str:
    value = (payload.get(field) or "").strip()
    if not value:
        raise APIError(f"{field} is required", 400)
    if max_length is not None and len(value) > max_length:
        raise APIError(f"{field} must be at most {max_length} characters", 400)
    return value


def optional_trimmed_string(payload: dict, field: str, *, max_length: int | None = None) -> str | None:
    value = (payload.get(field) or "").strip()
    if not value:
        return None
    if max_length is not None and len(value) > max_length:
        raise APIError(f"{field} must be at most {max_length} characters", 400)
    return value
