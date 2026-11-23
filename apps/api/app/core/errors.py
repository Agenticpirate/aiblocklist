from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse


class ProblemDetailError(Exception):
    def __init__(
        self,
        status_code: int,
        code: str,
        title: str,
        detail: str,
        error_type: str | None = None,
    ) -> None:
        self.status_code = status_code
        self.code = code
        self.title = title
        self.detail = detail
        self.error_type = error_type or f"https://api.aiblocklist.com/errors/{code.lower().replace('_', '-')}"
        super().__init__(detail)


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(ProblemDetailError)
    async def handle_problem_detail(request: Request, exc: ProblemDetailError) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            media_type="application/problem+json",
            content={
                "type": exc.error_type,
                "title": exc.title,
                "status": exc.status_code,
                "code": exc.code,
                "detail": exc.detail,
                "instance": str(request.url.path),
            },
        )
