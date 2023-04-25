#!/bin/bash
if [ -d "wsproxy" ]
then
ts-node server.ts &
MAINCHIMERAPID=$!
cd wsproxy
PORT="8001" node index.js
kill $MAINCHIMERAPID
else
echo "wsproxy was not cloned... not starting websocket proxy"
ts-node server.ts
fi

