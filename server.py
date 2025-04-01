import sys
from http.server import HTTPServer, SimpleHTTPRequestHandler

class Handler(SimpleHTTPRequestHandler):
    def handle_error(self, request, client_address):
        if not "Broken pipe" in str(sys.exc_info()[1]):
            super().handle_error(request, client_address)

HTTPServer(("127.0.0.1", 8000), Handler).serve_forever()