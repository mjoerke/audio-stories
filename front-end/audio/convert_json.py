# to generate the json containing the base46 encoded .mp3 run these commands after inserting the correct text in request.json
  
# export export GOOGLE_APPLICATION_CREDENTIALS="/mnt/c/users/jacob/stanford/keys/audio-project-284021-288c43d314ac.json"
# curl -X POST -H "Authorization: Bearer "$(gcloud auth application-default print-access-token) -H "Content-Type: application/json; charset=utf-8" -d @request.json https://texttospeech.googleapis.com/v1/text:synthesize > indoors.json

# then run this script to convert the resulting .json file to a playable .mp3
# python convert_json.py indoors.json #produces indoors.mp3

import json
import argparse
import subprocess

parser = argparse.ArgumentParser(description='Convert json to raw base64')
parser.add_argument('filename', type=str,
                    help='file name')

args = parser.parse_args()

out_file_name = args.filename.split(".json")[0] + ".txt"
audio_file_name = args.filename.split(".json")[0] + ".mp3"

with open(args.filename) as f:
    obj = json.loads(f.read())

s = obj["audioContent"]

with open(out_file_name, "w") as f:
    f.write(s)

with open(audio_file_name, "w") as f:
    subprocess.run("base64 -d " + out_file_name + " > " + audio_file_name, shell=True)