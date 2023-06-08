#!/bin/bash
if ! [ -z ${idiot+x} ]; then
  echo "idiot envvar is set, compiling typescript..."
  tsc 
fi 
if [ -d "wsproxy" ]; then
    cd server
    ts-node server.ts &
    MAINANURAPID=$!
    cd ../wsproxy
    PORT="8001" node index.js
    kill $MAINANURAPID
else
    echo "wsproxy was not cloned... not starting websocket proxy"
    cd server
    ts-node server.ts &
fi
docker rm relay
docker run --privileged -p 8082:80 --name relay benjamincburns/jor1k-relay:latest
