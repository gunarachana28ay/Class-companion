#!/bin/bash

# Check if the first parameter is provided
if [ -z "$1" ]; then
    echo "No keypair file passed. Will try to use keypair 'class_companion_keypair.pem' from home directory (~)"
    keypairFile="~/class_companion_keypair.pem"
else
    keypairFile=$1
fi

cd ./frontend
npm run build
cd ..

scp -r -i $keypairFile ./frontend/build/* ubuntu@ec2-13-49-57-37.eu-north-1.compute.amazonaws.com:~/ClassCompanion/frontend/build
# scp -r -i $keypairFile ./backend/* ubuntu@ec2-13-49-57-37.eu-north-1.compute.amazonaws.com:~/ClassCompanion 
