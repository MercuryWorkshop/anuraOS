#!/bin/bash
python3 main.py > webserver.log &
exec aboutproxy/main.sh > aboutproxy.log