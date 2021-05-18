import copy
import json
import os
from typing import Dict, Optional

from server.speech_generator import SpeechGenerator


class NonexistentAudioStoryError(Exception):
    pass


class AudioStoryAlreadyExistsError(Exception):
    pass


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
    def graph(self) -> Dict:
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

    def relative_to(self, root_path: str = "/") -> Dict:
        new_graph = copy.deepcopy(self._graph)

        for node_id, node in self._graph["nodes"].items():
            if node["type"] == "audio" and "audio_file" in node:
                abspath = node["audio_file"]
                rel_path = os.path.relpath(abspath, root_path)
                new_graph["nodes"][node_id]["audio_file"] = rel_path

        return new_graph


class AudioStoryLoader():
    def __init__(self,
                 save_dir: str,
                 audio_save_dir: str,
                 speech_generator: Optional[SpeechGenerator] = None):
        self.save_dir = save_dir
        self.audio_save_dir = audio_save_dir
        self.speech_generator = speech_generator

    def _get_savepath(self, story_id: str) -> str:
        return os.path.join(self.save_dir, story_id + ".json")

    def save(self,
             audio_file_graph: Dict,
             story_id: str,
             check_exists: bool = False,
             generate_audio: bool = True) -> None:
        savepath = self._get_savepath(story_id)

        if check_exists:
            if os.path.exists(savepath):
                raise AudioStoryAlreadyExistsError(
                    "Audio story with id {} already exists".format(story_id))

        audio_story = AudioStoryGraph.from_json(audio_file_graph)

        if generate_audio:
            assert self.speech_generator, "Must provide speech_generator"

            if not audio_story.has_audio_files():
                audio_savepath = os.path.join(
                    self.audio_save_dir,
                    "{story_id}_{node_id}.mp3".format(story_id=story_id,
                                                      node_id="{node_id}"))
                audio_story.generate_audio(self.speech_generator,
                                           audio_savepath)

        audio_story.save(savepath)

    def load(self,
             story_id: str,
             must_have_audio: bool = True,
             audio_relative_to: str = "/") -> Dict:
        savepath = self._get_savepath(story_id)
        try:
            audio_story = AudioStoryGraph.from_file(savepath)
        except OSError:
            existing_audio_files = self.get_audio_stories()
            raise NonexistentAudioStoryError(
                "Audio story with id '{}' does not exist! Existing audio stories include: {}"
                .format(story_id, str(existing_audio_files)))

        if must_have_audio:
            assert audio_story.has_audio_files()

        graph = audio_story.relative_to(audio_relative_to)

        return graph

    def get_audio_stories(self):
        audio_story_files = os.listdir(self.save_dir)

        audio_story_files = [
            elt.replace(".json", "") for elt in audio_story_files
            if os.path.join(self.save_dir, elt) != self.audio_save_dir
        ]

        return audio_story_files
