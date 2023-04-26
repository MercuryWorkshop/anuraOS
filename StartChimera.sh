#!/bin/bash
if [ -d "wsproxy" ]
then
ts-node server.ts &
MAINANURAPID=$!
cd wsproxy
PORT="8001" node index.js
kill $MAINANURAPID
else
echo "wsproxy was not cloned... not starting websocket proxy"
ts-node server.ts
fi

