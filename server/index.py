import http
import json

import fire
import flask
from PIL import Image
from werkzeug.exceptions import HTTPException

from server import model_utils

app = flask.Flask(__name__)
model = None


class InvalidLabelException(Exception):
    pass


@app.errorhandler(HTTPException)
def handle_exception(e):
    """Return JSON instead of HTML"""
    response = e.get_response()
    response.data = json.dumps({
        "code": e.code,
        "name": e.name,
        "description": e.description
    })
    response.content_type = "application/json"

    return response


@app.errorhandler(InvalidLabelException)
def handle_invalid_label_exception(e):
    return str(e), http.HTTPStatus.UNPROCESSABLE_ENTITY


@app.route('/')
def index():
    return "This is the audio stories server."


@app.route('/check')
def check():
    return "It's working!"


@app.route('/inference', methods=['POST'])
def inference():
    global model

    img_file = flask.request.files['image']
    image = Image.open(img_file.stream)

    labels_json = flask.request.form['labels']
    try:
        labels = json.loads(labels_json)
    except ValueError as ve:
        raise InvalidLabelException(
            "Invalid labels provided: {}. Labels must be JSON. Produced the following error: {}"
            .format(labels_json, str(ve)))

    scores = model.inference(image, labels).tolist()

    response = flask.jsonify(scores)
    response.headers.add('Access-Control-Allow-Origin', '*')

    return response


def run_app(debug=True, port=5000, host="0.0.0.0", device="cuda"):
    global model
    model = model_utils.CLIPModel(device)
    app.run(debug=debug, port=port, host=host)


if __name__ == "__main__":
    fire.Fire(run_app)
