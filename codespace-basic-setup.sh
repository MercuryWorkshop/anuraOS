#!/bin/bash
set -euxo pipefail

#fix the uuidgen command not found error
sudo apt update
sudo apt upgrade
sudo apt install -y uuid-runtime gcc-multilib

#install
git submodule update --init
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --profile minimal --target wasm32-unknown-unknown,i686-unknown-linux-gnu
source "$HOME/.cargo/env" # to import rustup in current shell
make all
