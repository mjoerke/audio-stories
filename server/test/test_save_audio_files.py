import json
import os
import shutil
import unittest

from server.save_audio_files import AudioStoryGraph, AudioStoryLoader
from server.speech_generator import DummySpeechGenerator


def _this_dir():
    return os.path.dirname(os.path.realpath(__file__))


def get_test_filepath(fname="audio_story_audio_start.json"):
    audio_file_path = os.path.join(_this_dir(), "..", "..", "data", "samples",
                                   fname)

    return audio_file_path


class TestAudioStoryGraph(unittest.TestCase):
    def _check_graph(self, graph_dict):
        assert "nodes" in graph_dict

    def setUp(self):
        self.test_dir = os.path.join(_this_dir(), "tmp")
        self.audio_dir = os.path.join(_this_dir(), "tmp_audio")

        if not os.path.exists(self.test_dir):
            os.makedirs(self.test_dir)

        if not os.path.exists(self.audio_dir):
            os.makedirs(self.audio_dir)

        assert os.path.exists(self.test_dir)
        assert os.path.exists(self.audio_dir)

    def tearDown(self):
        shutil.rmtree(self.test_dir)
        shutil.rmtree(self.audio_dir)

    def test_from_file(self):
        filepath = get_test_filepath()
        audio_story_graph = AudioStoryGraph.from_file(filepath)
        self._check_graph(audio_story_graph.graph)

    def test_from_json(self):
        filepath = get_test_filepath()
        with open(filepath) as infile:
            graph_dict = json.load(infile)

        audio_story_graph = AudioStoryGraph.from_json(graph_dict)

        assert audio_story_graph.graph == graph_dict
        graph_dict["nodes"] = {}

        assert len(audio_story_graph.graph["nodes"])

    def test_no_mutate_graph(self):
        filepath = get_test_filepath()
        audio_story_graph = AudioStoryGraph.from_file(filepath)
        with self.assertRaises(AttributeError):
            audio_story_graph.graph = {}

    def test_generate_audio(self):
        filepath = get_test_filepath("one_audio_node.json")
        audio_story_graph = AudioStoryGraph.from_file(filepath)
        savepath = os.path.join(self.audio_dir, "{node_id}.json")

        speech_generator = DummySpeechGenerator()
        audio_story_graph.generate_audio(speech_generator, savepath)

        audio_files = os.listdir(self.audio_dir)
        assert len(audio_files) == 1
        audio_path = os.path.join(self.audio_dir, "0.json")
        assert os.path.exists(audio_path)

    def test_generate_audio_multiple(self):
        filepath = get_test_filepath("two_audio_nodes.json")
        audio_story_graph = AudioStoryGraph.from_file(filepath)
        savepath = os.path.join(self.audio_dir, "{node_id}.json")

        speech_generator = DummySpeechGenerator()
        audio_story_graph.generate_audio(speech_generator, savepath)

        audio_files = os.listdir(self.audio_dir)
        assert len(audio_files) == 2
        audio_path = os.path.join(self.audio_dir, "0.json")
        assert os.path.exists(audio_path)
        audio_path = os.path.join(self.audio_dir, "1.json")
        assert os.path.exists(audio_path)

    def test_generate_audio_with_classifier_nodes(self):
        filepath = get_test_filepath("two_audio_one_classifier.json")
        audio_story_graph = AudioStoryGraph.from_file(filepath)
        savepath = os.path.join(self.audio_dir, "{node_id}.json")

        speech_generator = DummySpeechGenerator()
        audio_story_graph.generate_audio(speech_generator, savepath)

        audio_files = os.listdir(self.audio_dir)
        assert len(audio_files) == 2
        audio_path = os.path.join(self.audio_dir, "0.json")
        assert os.path.exists(audio_path)
        audio_path = os.path.join(self.audio_dir, "1.json")
        assert os.path.exists(audio_path)
        audio_path = os.path.join(self.audio_dir, "2.json")
        assert not os.path.exists(audio_path)


class TestAudioStoryLoader(unittest.TestCase):
    def setUp(self):
        self.test_dir = os.path.join(_this_dir(), "tmp")
        self.audio_dir = os.path.join(_this_dir(), "tmp_audio")

        if not os.path.exists(self.test_dir):
            os.makedirs(self.test_dir)

        if not os.path.exists(self.audio_dir):
            os.makedirs(self.audio_dir)

        assert os.path.exists(self.test_dir)
        assert os.path.exists(self.audio_dir)

    def tearDown(self):
        shutil.rmtree(self.test_dir)
        shutil.rmtree(self.audio_dir)

    def test_save_no_audio(self):
        story_id = "my_story"

        audio_story_loader = AudioStoryLoader(save_dir=self.test_dir,
                                              audio_save_dir=self.audio_dir)
        audio_story_loader.save(audio_file_graph={},
                                story_id=story_id,
                                generate_audio=False)

        tmp_files = os.listdir(self.test_dir)
        assert len(tmp_files) == 1
        assert any([story_id in fname for fname in tmp_files])

    def test_load_no_audio(self):
        story_id = "test_load_story"
        filepath = get_test_filepath()
        with open(filepath) as infile:
            graph_dict = json.load(infile)

        audio_story_loader = AudioStoryLoader(save_dir=self.test_dir,
                                              audio_save_dir=self.audio_dir)
        audio_story_loader.save(graph_dict, story_id, generate_audio=False)

        tmp_files = os.listdir(self.test_dir)
        assert len(tmp_files) == 1
        assert any([story_id in fname for fname in tmp_files])

        audio_story = audio_story_loader.load(story_id, must_have_audio=False)
        assert audio_story.graph == graph_dict


if __name__ == "__main__":
    unittest.main()
