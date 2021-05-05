import copy
import json
import os
from typing import Dict


class AudioStoryGraph():
    def __init__(self, graph):
        self._graph = graph
        pass

    @staticmethod
    def from_file(file_path: str) -> 'AudioStoryGraph':
        with open(file_path) as infile:
            graph = json.load(infile)

        return AudioStoryGraph(graph)

    @staticmethod
    def from_json(json_graph: Dict) -> 'AudioStoryGraph':
        return AudioStoryGraph(copy.deepcopy(json_graph))

    def save(self, path: str) -> None:
        with open(path) as outfile:
            json.dump(self._graph, outfile)


class AudioStoryLoader():
    def __init__(self, save_dir):
        self.save_dir = save_dir

    def _get_savepath(self, story_id: str) -> str:
        return os.path.join(self.save_dir, story_id + ".json")

    def save(self,
             audio_file_graph: Dict,
             story_id: str,
             check_exists: bool = False) -> None:
        savepath = self._get_savepath(story_id)

        if check_exists:
            if os.path.exists(savepath):
                raise RuntimeError(
                    "Audio story with id {} already exists".format(story_id))

        audio_story = AudioStoryGraph.from_json(audio_file_graph)
        audio_story.save(savepath)

    def load(self, story_id: str) -> AudioStoryGraph:
        savepath = self._get_savepath(story_id)
        audio_story = AudioStoryGraph.from_file(savepath)

        return audio_story
