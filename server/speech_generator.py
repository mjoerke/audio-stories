import os
import shutil


class SpeechGenerator:
    """
    This is currently a dummy class! Will add in actual functionality later.
    """
    def __init__(self):
        pass

    def to_speech(self, transcript: str, savepath: str) -> None:
        # for now, just load a sample file
        this_dir = os.path.dirname(os.path.realpath(__file__))
        sample_path = os.path.join(this_dir, "server_data", "audio",
                                   "outdoors.mp3")
        assert os.path.exists(sample_path)
        shutil.copyfile(sample_path, savepath)
