from __future__ import annotations

import http.server
import os
import pathlib
import socketserver
from urllib.parse import unquote


ROOT = pathlib.Path(__file__).resolve().parent


class SpaHandler(http.server.SimpleHTTPRequestHandler):
    """Serve a static folder with SPA fallback to index.html."""

    def translate_path(self, path: str) -> str:
        # Based on SimpleHTTPRequestHandler.translate_path, but rooted to our folder.
        path = path.split("?", 1)[0]
        path = path.split("#", 1)[0]
        path = unquote(path)
        trailing_slash = path.rstrip().endswith("/")
        parts = [p for p in path.split("/") if p and p not in (".", "..")]
        resolved = ROOT.joinpath(*parts)
        if trailing_slash:
            return str(resolved) + os.sep
        return str(resolved)

    def do_GET(self) -> None:
        # If the requested file exists, serve normally.
        candidate = pathlib.Path(self.translate_path(self.path))

        # Directory -> let default handler resolve index.html inside it.
        if candidate.is_dir():
            return super().do_GET()

        if candidate.exists():
            return super().do_GET()

        # If an asset is requested under a route prefix (e.g. /about/asset/...),
        # try stripping the first segment and serving from the site root.
        # This makes local deep-link refresh work even with relative asset URLs.
        request_path = self.path.split('?', 1)[0].split('#', 1)[0]
        parts = [p for p in request_path.split('/') if p]
        if len(parts) >= 2 and '.' in parts[-1]:
            alt_path = '/' + '/'.join(parts[1:])
            alt_candidate = pathlib.Path(self.translate_path(alt_path))
            if alt_candidate.exists():
                self.path = alt_path
                return super().do_GET()

        # SPA fallback: serve index.html for any unknown route-like path.
        # Only do this when the request doesn't look like a file.
        if not parts or '.' not in parts[-1]:
            self.path = "/index.html"
            return super().do_GET()

        # Unknown file: return 404.
        return super().do_GET()


def main() -> None:
    port = int(os.environ.get("PORT", "5500"))
    with socketserver.TCPServer(("127.0.0.1", port), SpaHandler) as httpd:
        print(f"Serving SPA on http://127.0.0.1:{port} (root: {ROOT})")
        httpd.serve_forever()


if __name__ == "__main__":
    main()
