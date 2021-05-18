import http.server, ssl

server_address = ('0.0.0.0', 5001)
httpd = http.server.HTTPServer(server_address, http.server.SimpleHTTPRequestHandler)
httpd.socket = ssl.wrap_socket(httpd.socket,
                               server_side=True,
                               certfile='/home/jacob_w_k_ritchie/keys/certbot/certfile.pem',
                               ssl_version=ssl.PROTOCOL_TLS)
httpd.serve_forever()
