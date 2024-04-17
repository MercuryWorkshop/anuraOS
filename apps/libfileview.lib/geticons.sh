#!/bin/bash
if [ -d "icons" ]; then
  echo "Icons already saved, remove icons folder to download again"
  exit 0
fi

git clone https://github.com/PapirusDevelopmentTeam/papirus-icon-theme.git papirus
mkdir icons
icon_paths=$(jq -r '.files[] | "\(.source) \(.icon)"' icons.json)
while read -r source icon_path
do
  cp "$source" "$icon_path"
done <<< "$icon_paths"
cp "$(jq -r '.defaultSource' icons.json)" "$(jq -r '.default' icons.json)" 
cp "$(jq -r '.folderSource' icons.json)" "$(jq -r '.folder' icons.json)" 
rm -rf papirus