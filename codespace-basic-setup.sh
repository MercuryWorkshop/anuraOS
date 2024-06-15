#!/bin/bash
#fix the uuidgen command not found error
sudo apt update
sudo apt-get install uuid-runtime

#install
git submodule update --init
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env" # to import rustup in current shell
make all

#start server
#cd server
#npm start -- --auth
#auth appears to be deprecated in this version, removing start section as suggested
