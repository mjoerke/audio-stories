#!/bin/bash

creds_file="server/audio-project-google-creds.json"
if [ ! -f "$creds_file" ]; then 
    echo "WARNING: Creds file $creds_file does not exist! You will not be able to use Google Text-To-Speech unless you specify this file"
else 
    export GOOGLE_APPLICATION_CREDENTIALS=$creds_file
fi 

python3 server/index.py $@
