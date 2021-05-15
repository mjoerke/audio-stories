# Audio-stories

### Example Stories

##### Format as provided by the design tool

For a story that starts with a classifier, see [`data/samples/audio_story_classifier_start.json`](data/samples/audio_story_classifier_start.json)

For a story that starts with an audio file, see [`data/samples/audio_story_audio_start.json`](data/samples/audio_story_audio_start.json)

##### Format as accepted by the front-end

Story that starts with a classifier:
```
{
    "nodes": {
        "0": {"type": "classifier", "labels": {"indoors": 1, "outdoors": 2}, "thresholds": {"indoors": 0.5,"outdoors":0.5}},
        "1": {"type": "audio", "next": 3, "audio_file": "audio/indoors.mp3"},
        "2": {"type": "audio", "next": 3, "audio_file": "audio/outdoors.mp3"},
        "3": {"type": "audio", "next": null, "audio_file": "audio/changes.mp3"}
    }
}
```
Story that starts with an audio file:
```
{
    "nodes": {
        "0": {"type": "audio", "next": 1, "audio_file": "audio/changes.mp3"}
        "1": {"type": "classifier", "labels": {"indoors": 2, "outdoors": 3}, "thresholds": {"indoors": 0.5,"outdoors":0.5}},
        "2": {"type": "audio", "next": 4, "audio_file": "audio/indoors.mp3"},
        "3": {"type": "audio", "next": 4, "audio_file": "audio/outdoors.mp3"},
        "4": {"type": "audio", "next": null, "audio_file": "audio/changes.mp3"}
    }
}
```

## Server

A Flask server provides access to the CLIP model.

### Setup

Make a conda environment and install the dependencies.

```
conda create --name "audio-stories" python=3.8
conda activate audio-stories
pip install -r server/requirements.txt
```

### Running the server

Here is the command to run the Flask server: 

```
./server/run.sh
```

This script automatically attempts to set Google TTS credentials, then starts the server.

Run `./server/run.sh --help` to see optional args.

### Running the server tests 

There are unit tests for the audio saving/loading functionality and integration tests for the API. Run them like this: 

`python3 -m pytest server/test`

### Files

- `server/index.py`: code to run the server, very bare-bones
- `server/create_app.py`: sets up the app, includes API endpoints
- `server/model_utils.py`: code for using the CLIP model 
- `server/save_audio_files.py`: code for storing and loading audio stories on the server
- `server/speech_generator.py`: code for doing text-to-speech
- `server/test`: tests

