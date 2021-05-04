import json

import fire
import flask
from PIL import Image

import model_utils

app = flask.Flask(__name__)
model = None


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
    labels = json.loads(labels_json)

    scores = model.inference(image, labels).tolist()

    return flask.jsonify(scores)


def run_app(debug=True, port=5000, host="0.0.0.0", device="cuda"):
    global model
    model = model_utils.CLIPModel(device)
    app.run(debug=debug, port=port, host=host)


if __name__ == "__main__":
    fire.Fire(run_app)
