import copy
import json
import os
from typing import Dict, Optional

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

    def has_audio_files(self) -> bool:
        """Are audio files available for this story?

        Args:

        Returns:
            bool: Whether all relevant audio files were found.
        """
        # check that every audio node has an audio file associated with it
        has_audio = True

        for node_id, node in self._graph["nodes"].items():
            if node["type"] == "audio":
                if not ("audio_file" in node
                        and os.path.exists(node["audio_file"])):
                    has_audio = False

                    break

        return has_audio

    def get_transcripts(self) -> Dict[str, str]:
        transcripts = {}

        for node_id, node in self._graph["nodes"].items():
            if node["type"] == "audio":
                transcripts[node_id] = node["audio_text"]

        return transcripts

    def generate_audio(self, speech_generator: SpeechGenerator,
                       savepath: str) -> None:
        """Generate audio for this story using speech-to-text.

        Args:
            speech_generator (SpeechGenerator): object to complete the
                text-to-speech
            savepath (str): where to save the audio files. Must include a
                formatting slot for the node id. For example:
                `my_save_name_node_{node_id}.mp3`

        Returns:
            None
        """
        transcripts = self.get_transcripts()

        for node_id, transcript in transcripts.items():
            node_savepath = savepath.format(node_id=node_id)
            speech_generator.to_speech(transcript, node_savepath)

            self._graph["nodes"][node_id]["audio_file"] = node_savepath


class AudioStoryLoader():
    def __init__(self, save_dir, audio_save_dir):
        self.save_dir = save_dir
        self.audio_save_dir = audio_save_dir

    def _get_savepath(self, story_id: str) -> str:
        return os.path.join(self.save_dir, story_id + ".json")

    def save(self,
             audio_file_graph: Dict,
             story_id: str,
             check_exists: bool = False,
             generate_audio: bool = True,
             speech_generator: Optional[SpeechGenerator] = None) -> None:
        savepath = self._get_savepath(story_id)

        if check_exists:
            if os.path.exists(savepath):
                raise RuntimeError(
                    "Audio story with id {} already exists".format(story_id))

        audio_story = AudioStoryGraph.from_json(audio_file_graph)

        if generate_audio:
            assert speech_generator, "Must provide speech_generator"

            if not audio_story.has_audio_files():
                savepath = os.path.join(
                    self.audio_save_dir,
                    "{story_id}_{node_id}.mp3".format(story_id=story_id))
                audio_story.generate_audio(speech_generator, savepath)

        audio_story.save(savepath)

    def load(self,
             story_id: str,
             must_have_audio: bool = True) -> AudioStoryGraph:
        savepath = self._get_savepath(story_id)
        audio_story = AudioStoryGraph.from_file(savepath)

        if must_have_audio:
            assert audio_story.has_audio_files()

        return audio_story
