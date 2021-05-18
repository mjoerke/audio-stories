import http
import json
import os

import flask
from PIL import Image
from werkzeug.exceptions import HTTPException

from server.model_utils import CLIPModel
from server.save_audio_files import (AudioStoryLoader,
                                     NonexistentAudioStoryError)
from server.speech_generator import GoogleSpeechGenerator

AUDIO_FILES_ENDPOINT = "/audio-files/"
AUDIO_STORY_FILES_DIR = os.path.join(
    os.path.dirname(os.path.realpath(__file__)), "server_data")
AUDIO_FILES_DIR = os.path.join(AUDIO_STORY_FILES_DIR, "audio")


class InvalidLabelException(Exception):
    pass


def create_app(device,
               save_dir,
               audio_save_dir,
               speech_gen_class=GoogleSpeechGenerator):
    app = flask.Flask(__name__)

    model = CLIPModel(device)

    speech_generator = speech_gen_class()
    audio_story_loader = AudioStoryLoader(save_dir=save_dir,
                                          audio_save_dir=audio_save_dir,
                                          speech_generator=speech_generator)

    @app.after_request
    def add_cors_headers(response):
        response.headers.add('Access-Control-Allow-Origin', '*')

        return response

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

    @app.errorhandler(NonexistentAudioStoryError)
    def handle_nonexistent_audio_story(e):
        return str(e), http.HTTPStatus.NOT_FOUND

    @app.route('/')
    def index():
        return "This is the audio stories server."

    @app.route('/check')
    def check():
        return "It's working!"

    @app.route('/inference', methods=['POST'])
    def inference():
        img_file = flask.request.files['image']
        image = Image.open(img_file.stream)
        print("image", image)

        labels_json = flask.request.form['labels']
        print("labels json", labels_json)
        try:
            labels = json.loads(labels_json)
        except ValueError as ve:
            raise InvalidLabelException(
                "Invalid labels provided: {}. Labels must be JSON. Produced the following error: {}"
                .format(labels_json, str(ve)))

        scores = model.inference(image, labels).tolist()

        response = flask.jsonify(scores)

        return response

    @app.route('{}<path:path>'.format(AUDIO_FILES_ENDPOINT))
    def serve_audio_file(path):

        return flask.send_from_directory(audio_save_dir, path)

    @app.route('/save-audio-story', methods=['POST'])
    def save_audio_story():
        audio_story = flask.request.get_json(force=True)
        audio_story_id = audio_story["story_id"]
        audio_story_loader.save(audio_story,
                                audio_story_id,
                                check_exists=True,
                                generate_audio=True)

        response = flask.jsonify("ok")

        return response

    @app.route('/load-audio-story/<string:story_id>')
    def load_audio_story(story_id):

        graph = audio_story_loader.load(story_id,
                                        must_have_audio=True,
                                        audio_relative_to=audio_save_dir)

        response = flask.jsonify(graph)

        return response

    return app
