#!/bin/bash
(trap 'kill 0' SIGINT EXIT; python3 -m http.server > webserver.log & aboutproxy/main.sh > aboutproxy.log & wait)
