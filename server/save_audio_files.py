import copy
import json
import os
from typing import Dict

from server.speech_generator import SpeechGenerator


class AudioStoryGraph():
    def __init__(self, graph):
        self._graph = graph

    @staticmethod
    def from_file(file_path: str) -> 'AudioStoryGraph':
        with open(file_path) as infile:
            graph = json.load(infile)

        return AudioStoryGraph(graph)

    @staticmethod
    def from_json(json_graph: Dict) -> 'AudioStoryGraph':
        return AudioStoryGraph(copy.deepcopy(json_graph))

    @property
    def graph(self):
        return self._graph

    def save(self, path: str) -> None:
        with open(path, 'w') as outfile:
            json.dump(self._graph, outfile)

    def get_transcripts(self) -> Dict[str, str]:
        transcripts = {}

        for node_id, node in self._graph["nodes"]:
            if node["type"] == "audio":
                transcripts[node_id] = node["audio_text"]

        return transcripts

    def generate_audio(self, speech_generator: SpeechGenerator) -> None:
        transcripts = self.get_transcripts()

        for node_id, transcript in transcripts.items():
            fname = ""
            savepath = None
            speech_generator.to_speech(transcript, savepath)

            self._graph["nodes"][node_id]["audio_file"] = fname


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
