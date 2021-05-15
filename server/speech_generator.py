import os
import shutil
from abc import ABC, abstractmethod

import google.cloud.texttospeech as tts


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


class GoogleSpeechGenerator(SpeechGenerator):
    """
    SpeechGenerator powered by Google text-to-speech.
    """
    def __init__(self, voice_name="en-US-Wavenet-H"):
        self.client = tts.TextToSpeechClient()
        self.voice_name = voice_name

    def to_speech(self, transcript: str, savepath: str) -> None:
        text_input = tts.SynthesisInput(text=transcript)
        language_code = "-".join(self.voice_name.split("-")[:2])
        voice_params = tts.VoiceSelectionParams(language_code=language_code,
                                                name=self.voice_name)
        audio_config = tts.AudioConfig(audio_encoding=tts.AudioEncoding.MP3)

        response = self.client.synthesize_speech(input=text_input,
                                                 voice=voice_params,
                                                 audio_config=audio_config)

        with open(savepath, "wb") as outfile:
            outfile.write(response.audio_content)
