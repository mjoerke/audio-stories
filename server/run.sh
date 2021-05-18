#!/bin/bash

creds_file="server/audio-project-google-creds.json"
cert_file="server/fullchain.pem"
key_file="server/privkey.pem"

if [ ! -f "$creds_file" ]; then 
    echo "WARNING: Creds file $creds_file does not exist! You will not be able to use Google Text-To-Speech unless you specify this file"
else 
    export GOOGLE_APPLICATION_CREDENTIALS=$creds_file
    export CERT_FILE_PATH=$cert_file
    export KEY_FILE_PATH=$key_file
fi 

python3 server/index.py $@
