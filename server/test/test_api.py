import copy
import json
import os
import shutil
import unittest

from server.create_app import create_app
from server.speech_generator import DummySpeechGenerator

URL = "http://127.0.0.1:5000/"


def _this_dir():
    return os.path.dirname(os.path.realpath(__file__))


class TestApi(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.save_dir = os.path.join(_this_dir(), "tmp")
        cls.audio_save_dir = os.path.join(_this_dir(), "tmp_audio")
        cls.client = create_app(
            device="cuda",
            save_dir=cls.save_dir,
            audio_save_dir=cls.audio_save_dir,
            speech_gen_class=DummySpeechGenerator).test_client()

    def setUp(self):
        if not os.path.exists(self.save_dir):
            os.makedirs(self.save_dir)

        if not os.path.exists(self.audio_save_dir):
            os.makedirs(self.audio_save_dir)

    def tearDown(self):
        shutil.rmtree(self.save_dir)
        shutil.rmtree(self.audio_save_dir)

    def _get_dummy_audio_file(self, fname):
        savepath = os.path.join(self.audio_save_dir, fname)
        speech_generator = DummySpeechGenerator()
        speech_generator.to_speech("", savepath=savepath)

    def _get_dummy_audio_graph(self, fname):
        audio_file_path = os.path.join(_this_dir(), "..", "..", "data",
                                       "samples", fname)
        with open(audio_file_path) as infile:
            graph = json.load(infile)

        return graph

    def test_ok(self):
        response = self.client.get("/check")
        self.assertEqual(200, response.status_code)

    def test_inference(self):
        this_file_dir = os.path.dirname(os.path.realpath(__file__))
        image_path = os.path.join(this_file_dir, "pug.jpg")
        labels = ['dog', 'cat']
        multipart_form_data = {
            'image': open(image_path, 'rb'),
            'labels': json.dumps(labels)
        }
        response = self.client.post("/inference", data=multipart_form_data)
        self.client.post()
        self.assertEqual(200, response.status_code)
        data = response.get_json()
        self.assertEqual(2, len(data))
        self.assertAlmostEqual(sum(data), 1, delta=0.001)

    def test_serve_audio_file(self):
        fname = "test.mp3"
        self._get_dummy_audio_file(fname)

        assert os.path.exists(os.path.join(self.audio_save_dir, fname))

        response = self.client.get("/audio-files/{}".format(fname))
        self.assertEqual(200, response.status_code)

    def test_save_audio_story(self):
        audio_story_graph = self._get_dummy_audio_graph("one_audio_node.json")
        audio_story_id = "story_id"
        audio_story_graph["story_id"] = audio_story_id
        response = self.client.post("/save-audio-story",
                                    json=audio_story_graph)
        self.assertEqual(200, response.status_code)

    def test_load_audio_story(self):
        audio_story_graph = self._get_dummy_audio_graph("one_audio_node.json")
        audio_story_id = "story_id"
        audio_story_graph["story_id"] = audio_story_id

        # post to save the story
        response = self.client.post("/save-audio-story",
                                    json=audio_story_graph)
        self.assertEqual(200, response.status_code)

        # now get the story back
        response = self.client.get(
            "/load-audio-story/{}".format(audio_story_id))
        self.assertEqual(200, response.status_code)
        returned_graph = response.get_json()

        # Check that I can get the audio files it returns
        audio_paths = [
            node["audio_file"] for _, node in returned_graph["nodes"].items()
        ]

        for audio_path in audio_paths:
            response = self.client.get("/audio-files/{}".format(audio_path))
            self.assertEqual(200, response.status_code)

        # check that the two files are equivalent, modulo the audio file key
        returned_graph_copy = copy.deepcopy(returned_graph)

        for node_id, node in returned_graph_copy["nodes"].items():
            node.pop("audio_file")
        self.assertEqual(audio_story_graph, returned_graph_copy)

        # check that the files are what I expected
        self.assertEqual("{}_0.mp3".format(audio_story_id),
                         returned_graph['nodes']['0']['audio_file'])


if __name__ == "__main__":
    unittest.main()
