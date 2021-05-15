import os
import shutil
import unittest

from server.speech_generator import GoogleSpeechGenerator


def _this_dir():
    return os.path.dirname(os.path.realpath(__file__))


class TestGoogleSpeechGenerator(unittest.TestCase):
    def setUp(self):
        self.assertTrue(
            os.environ.get('GOOGLE_APPLICATION_CREDENTIALS', False),
            "You didn't specify credentials!")
        self.test_dir = os.path.join(_this_dir(), "tmp")

        if not os.path.exists(self.test_dir):
            os.makedirs(self.test_dir)

    def tearDown(self):
        shutil.rmtree(self.test_dir)

    def test_to_speech(self):
        text = "Hello, world"
        speechgen = GoogleSpeechGenerator()
        savepath = os.path.join(self.test_dir, "test_audio.mp3")
        speechgen.to_speech(transcript=text, savepath=savepath)

        self.assertTrue(os.path.exists(savepath))

        with open(savepath, 'rb') as infile:
            bytes = infile.read()
        assert len(bytes) > 0
