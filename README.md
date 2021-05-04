# Audio-stories

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
python3 server/server.py
```

Run `python3 server/server.py --help` to see optional args.

### Files

- `server/server.py`: code to run the server, contains API endpoints
- `server/model_utils.py`: code for using the CLIP model 
- `server/test`: some informal files used for testing. See `server/test/test_api.py` for an example of how to send an inference request to the server.

