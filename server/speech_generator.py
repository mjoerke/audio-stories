import os
import shutil
from abc import ABC, abstractmethod


class SpeechGenerator(ABC):
    @abstractmethod
    def to_speech(self, transcript: str, savepath: str) -> None:
        raise NotImplementedError()


class DummySpeechGenerator(SpeechGenerator):
    """
    Dummy class for testing.
    """
    def to_speech(self, transcript: str, savepath: str) -> None:
        # for now, just load a sample file
        this_dir = os.path.dirname(os.path.realpath(__file__))
        sample_path = os.path.join(this_dir, "server_data", "audio",
                                   "outdoors.mp3")
        assert os.path.exists(sample_path)
        shutil.copyfile(sample_path, savepath)
