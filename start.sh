#!/bin/bash
python3 -m http.server > webserver.log &
exec aboutproxy/main.sh > aboutproxy.log
