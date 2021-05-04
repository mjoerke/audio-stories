import json
import os

import requests

URL = "http://127.0.0.1:5000/"


def _check_request(r):
    if r.status_code == 200:
        return
    raise RuntimeError("Problem http code: {}: {}".format(
        r.status_code, r.content))


def send_image():
    this_file_dir = os.path.dirname(os.path.realpath(__file__))
    image_path = os.path.join(this_file_dir, "pug.jpg")
    endpoint = URL + 'inference'
    labels = ['dog', 'cat']
    multipart_form_data = {
        'image': ('image.jpg', open(image_path, 'rb')),
        'labels': (None, json.dumps(labels))
    }
    r = requests.post(endpoint, files=multipart_form_data)
    _check_request(r)
    print("RESPONSE", r.json())


def send_invalid():
    this_file_dir = os.path.dirname(os.path.realpath(__file__))
    image_path = os.path.join(this_file_dir, "pug.jpg")
    endpoint = URL + 'inference'
    multipart_form_data = {
        'image': ('image.jpg', open(image_path, 'rb')),
        'labels': (None, "blah")
    }
    r = requests.post(endpoint, files=multipart_form_data)
    print(r.content)


if __name__ == "__main__":
    send_image()
    # send_invalid()
