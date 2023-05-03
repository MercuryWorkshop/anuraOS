#!/bin/bash -e
rm -r build/lib/*
tsc

# prod only
# google-closure-compiler "build/lib/*.js" --js_output_file build/dist.js --source_map_input "build/lib/*.js|build/lib/*.js.map" --create_source_map build/dist.js.map

# echo "//# sourceMappingURL=dist.js.map" >> build/dist.js
