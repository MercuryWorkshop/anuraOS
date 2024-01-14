#!/bin/sh
mkdir -p icons
git clone https://github.com/PapirusDevelopmentTeam/papirus-icon-theme.git papirus
cp papirus/Papirus/16x16/mimetypes/* icons/ 
rm -rf papirus