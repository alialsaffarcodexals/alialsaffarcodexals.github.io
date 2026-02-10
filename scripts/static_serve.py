#!/usr/bin/env python3
import argparse
import os
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler


REQUIRED_FILES = [
    "index.html",
    "404.html",
    "500.html",
    os.path.join("styles", "main.css"),
    os.path.join("assets", "logo.svg"),

    # Core pages (so accidental deletion/rename shows a 500-style maintenance error)
    os.path.join("pages", "profile.html"),
    os.path.join("pages", "analytics.html"),
    os.path.join("pages", "activity.html"),
    os.path.join("pages", "transactions.html"),
    os.path.join("pages", "projects.html"),
]


def missing_required(base_dir: str):
    missing = []
    for rel in REQUIRED_FILES:
        if not os.path.isfile(os.path.join(base_dir, rel)):
            missing.append(rel)
    return missing


class Themed404Handler(SimpleHTTPRequestHandler):
    """Serve static files and themed error pages (404/500).

    - 404: returns /404.html
    - 500: returns /500.html (used when required files are missing or on server exceptions)
    """

    def __init__(self, *args, directory=None, **kwargs):
        # IMPORTANT: send_error() can be triggered during the base class init/handling
        # path, so set base_dir first.
        self._base_dir = os.path.abspath(directory or os.getcwd())
        self._missing = missing_required(self._base_dir)
        super().__init__(*args, directory=self._base_dir, **kwargs)

    def _send_custom_file(self, code: int, filename: str, reason: str):
        path = os.path.join(self._base_dir, filename)
        if not os.path.isfile(path):
            return False
        try:
            self.send_response(code, reason)
            ctype = self.guess_type(path)
            self.send_header("Content-Type", ctype)
            fs = os.stat(path)
            self.send_header("Content-Length", str(fs.st_size))
            self.end_headers()
            with open(path, "rb") as f:
                self.wfile.write(f.read())
            return True
        except Exception:
            return False

    def _should_force_500(self):
        if not self._missing:
            return False
        req_path = (self.path or "").split("?", 1)[0]
        is_asset = any(
            req_path.endswith(ext)
            for ext in (
                ".css",
                ".js",
                ".mjs",
                ".svg",
                ".png",
                ".jpg",
                ".jpeg",
                ".gif",
                ".webp",
                ".ico",
                ".woff",
                ".woff2",
                ".ttf",
                ".map",
            )
        )
        return not is_asset

    def do_HEAD(self):
        # Mirror the GET behavior for browsers/tools that issue HEAD requests.
        if self._should_force_500():
            # send headers for the themed 500 page
            path = os.path.join(self._base_dir, "500.html")
            if os.path.isfile(path):
                self.send_response(500, "Internal Server Error")
                self.send_header("Content-Type", self.guess_type(path))
                self.send_header("Content-Length", str(os.stat(path).st_size))
                self.end_headers()
                return
        return super().do_HEAD()

    def do_GET(self):
        """Serve files normally.

        If the site is in a broken state (missing required core files), we still want
        CSS/images to load so the 500 page can be styled. So:
        - For asset requests (css/js/images/etc), serve as normal.
        - For page/navigation requests, show the themed 500 page.
        """
        if self._should_force_500():
            if self._send_custom_file(500, "500.html", "Internal Server Error"):
                return

        try:
            return super().do_GET()
        except Exception:
            # Any unhandled error -> 500 themed page
            if self._send_custom_file(500, "500.html", "Internal Server Error"):
                return
            raise

    def send_error(self, code, message=None, explain=None):
        if code == 404:
            if self._send_custom_file(404, "404.html", "Not Found"):
                return
        if code == 500:
            if self._send_custom_file(500, "500.html", "Internal Server Error"):
                return
        return super().send_error(code, message, explain)


def main():
    p = argparse.ArgumentParser(description="Static server with themed 404.html")
    p.add_argument("--port", type=int, default=int(os.environ.get("PORT", 8000)))
    p.add_argument("--dir", default=os.environ.get("DIR", os.path.join(os.getcwd(), "public")))
    args = p.parse_args()

    directory = os.path.abspath(args.dir)
    if not os.path.isdir(directory):
        raise SystemExit(f"Directory not found: {directory}")

    server = ThreadingHTTPServer(("", args.port), lambda *a, **kw: Themed404Handler(*a, directory=directory, **kw))
    print(f"Serving {directory} on http://0.0.0.0:{args.port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
