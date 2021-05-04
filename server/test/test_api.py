import json

import requests

URL = "http://127.0.0.1:5000/"


def _check_request(r):
    if r.status_code == 200:
        return
    raise RuntimeError("Problem http code: {}: {}".format(
        r.status_code, r.content))


def send_image():
    endpoint = URL + 'inference'
    labels = ['dog', 'cat']
    multipart_form_data = {
        'image': ('image.jpg', open('pug.jpg', 'rb')),
        'labels': (None, json.dumps(labels))
    }
    r = requests.post(endpoint, files=multipart_form_data)
    _check_request(r)
    print("RESPONSE", r.json())


if __name__ == "__main__":
    send_image()
