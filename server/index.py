import http
import json
import os

import fire
import flask
from PIL import Image
from werkzeug.exceptions import HTTPException

from server.model_utils import CLIPModel
from server.save_audio_story import AudioStoryLoader
from server.speech_generator import DummySpeechGenerator

app = flask.Flask(__name__)
model = None
audio_story_loader = None

AUDIO_FILES_ENDPOINT = "/audio-files/"
AUDIO_STORY_FILES_DIR = os.path.join(
    os.path.dirname(os.path.realpath(__file__)), "server_data")
AUDIO_FILES_DIR = os.path.join(AUDIO_STORY_FILES_DIR, "audio")


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


@app.route('{}<path:path>'.format(AUDIO_FILES_ENDPOINT))
def serve_audio_file(path):
    return flask.send_from_directory(AUDIO_FILES_DIR, path)


@app.route('/save-audio-story', methods=['POST'])
def save_audio_story():
    global audio_story_loader

    audio_story = flask.request.json
    audio_story_id = audio_story["story_id"]
    audio_story_loader.save(audio_story,
                            audio_story_id,
                            check_exists=True,
                            generate_audio=True)


@app.route('/load-audio-story/<string:story_id>')
def load_audio_story(story_id):
    global audio_story_loader

    graph = audio_story_loader.load(story_id,
                                    must_have_audio=True,
                                    audio_relative_to=AUDIO_FILES_DIR)

    return flask.jsonify(graph)


def run_app(debug=True,
            port=5000,
            host="0.0.0.0",
            device="cuda",
            save_dir=AUDIO_STORY_FILES_DIR,
            audio_save_dir=AUDIO_FILES_DIR):

    global model
    global audio_story_loader

    model = CLIPModel(device)

    speech_generator = DummySpeechGenerator()
    audio_story_loader = AudioStoryLoader(save_dir=save_dir,
                                          audio_save_dir=audio_save_dir,
                                          speech_generator=speech_generator)
    app.run(debug=debug, port=port, host=host)


if __name__ == "__main__":
    fire.Fire(run_app)
