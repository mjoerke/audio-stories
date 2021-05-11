import json
import os
import shutil
import unittest

from server.save_audio_files import AudioStoryGraph, AudioStoryLoader


def _this_dir():
    return os.path.dirname(os.path.realpath(__file__))


def get_test_filepath():
    audio_file_path = os.path.join(_this_dir(), "..", "..", "data", "samples",
                                   "audio_story_audio_start.json")

    return audio_file_path


class TestAudioStoryGraph(unittest.TestCase):
    def _check_graph(self, graph_dict):
        assert "nodes" in graph_dict

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


class TestAudioStoryLoader(unittest.TestCase):
    def setUp(self):
        self.test_dir = os.path.join(_this_dir(), "tmp")

        if not os.path.exists(self.test_dir):
            os.makedirs(self.test_dir)

        assert os.path.exists(self.test_dir)

    def tearDown(self):
        shutil.rmtree(self.test_dir)

    def test_save(self):
        story_id = "my_story"

        audio_story_loader = AudioStoryLoader(save_dir=self.test_dir)
        audio_story_loader.save(audio_file_graph={}, story_id=story_id)

        tmp_files = os.listdir(self.test_dir)
        assert len(tmp_files) == 1
        assert any([story_id in fname for fname in tmp_files])

    def test_load(self):
        story_id = "test_load_story"
        filepath = get_test_filepath()
        with open(filepath) as infile:
            graph_dict = json.load(infile)

        audio_story_loader = AudioStoryLoader(save_dir=self.test_dir)
        audio_story_loader.save(graph_dict, story_id)

        tmp_files = os.listdir(self.test_dir)
        assert len(tmp_files) == 1
        assert any([story_id in fname for fname in tmp_files])

        audio_story = audio_story_loader.load(story_id)
        assert audio_story.graph == graph_dict


if __name__ == "__main__":
    unittest.main()
