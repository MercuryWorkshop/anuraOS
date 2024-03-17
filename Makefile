SHELL := bash

RUST_FILES=$(shell find v86/src/rust/ -name '*.rs') \
	   v86/src/rust/gen/interpreter.rs v86/src/rust/gen/interpreter0f.rs \
	   v86/src/rust/gen/jit.rs v86/src/rust/gen/jit0f.rs \
	   v86/src/rust/gen/analyzer.rs v86/src/rust/gen/analyzer0f.rs

all: build/bootstrap v86dirty v86 build/nohost-sw.js bundle public/config.json build/cache-load.json apps/libfileview.lib/icons build/libcurl.mjs build/lib/bare.cjs build/assets/matter.css build/dreamland 

full: all rootfs-debian rootfs-arch rootfs-alpine

hooks: FORCE
	mkdir -p .git/hooks
	echo -e "#!/bin/sh\nmake lint\ngit add -A" > .git/hooks/pre-commit
	chmod +x .git/hooks/pre-commit

apps/libfileview.lib/icons:
	cd apps/libfileview.lib; bash geticons.sh

public/config.json:
	cp config.default.json public/config.json

build/bootstrap: package.json server/package.json
	mkdir -p build/lib
	npm i
	cd server; npm i
	make hooks
	>build/bootstrap

build/nohost-sw.js:
	cd nohost; npm i; npm run build; cp -r dist/* ../build/

build/libcurl.mjs: build/bootstrap
	cp node_modules/libcurl.js/libcurl.mjs build/; cp node_modules/libcurl.js/libcurl.wasm build/

build/lib/bare.cjs: build/bootstrap
	cp node_modules/@mercuryworkshop/bare-client-custom/dist/bare.cjs build/lib/bare.cjs

build/assets/matter.css:
	mkdir -p build/assets
	curl https://github.com/finnhvman/matter/releases/latest/download/matter.css -L -o build/assets/matter.css

clean:
	cd v86; make clean
	rm -rf build/*

rootfs-debian: FORCE
	cd x86_image_wizard/debian; sh build-debian-bin.sh

rootfs-arch: FORCE
	cd x86_image_wizard/arch; sh build-arch-bin.sh

rootfs-alpine: FORCE
	cd x86_image_wizard/alpine; sh build-alpine-bin.sh

rootfs: FORCE
	cd x86_image_wizard; sh x86_image_wizard.sh

v86dirty: 
	touch v86timestamp # makes it "dirty" and forces recompilation

v86: libv86.js build/lib/v86.wasm
	cp -r v86/bios public

build/cache-load.json: FORCE
	(find apps/ -type f && cd build/ && find lib/ -type f && cd ../public/ && find . -type f)| grep -v -e node_modules -e .map -e "/\." | jq -Rnc '[inputs]' > build/cache-load.json

libv86.js: v86/src/*.js v86/lib/*.js v86/src/browser/*.js
	cd v86; make build/libv86.js
	cp v86/build/libv86.js build/lib/libv86.js

build/lib/v86.wasm: $(RUST_FILES) v86/build/softfloat.o v86/build/zstddeclib.o v86/Cargo.toml
	cd v86; make build/v86.wasm
	cp v86/build/v86.wasm build/lib/v86.wasm

build/dreamland:
	mkdir -p build/dreamland
	git clone https://github.com/MercuryWorkshop/dreamlandjs.git dreamland.tmp --depth 1
	cd dreamland.tmp; npm i; npx rollup -c -f iife 
	cp dreamland.tmp/dist/js.js build/dreamland/js.js
	cp dreamland.tmp/dist/js.js.map build/dreamland/js.js.map
	cp dreamland.tmp/dist/css.js build/dreamland/css.js
	cp dreamland.tmp/dist/css.js.map build/dreamland/css.js.map
	cp dreamland.tmp/dist/html.js build/dreamland/html.js
	cp dreamland.tmp/dist/html.js.map build/dreamland/html.js.map
	rm -rf dreamland.tmp

watch: bundle FORCE
	which inotifywait || echo "INSTALL INOTIFYTOOLS"
	shopt -s globstar; while true; do inotifywait -e close_write ./src/**/* &>/dev/null;clear; make tsc & make css & make milestone; echo "Done!"; sleep 1; done
tsc:
	mkdir -p build/artifacts
	cp -r src/* build/artifacts
	npx tsc
css: src/*.css
	# shopt -s globstar; cat src/**/*.css | npx postcss --use autoprefixer -o build/bundle.css
	shopt -s globstar; cat src/**/*.css > build/bundle.css
bundle: tsc css lint milestone
	mkdir -p build/artifacts
milestone:
	uuidgen > build/MILESTONE
lint:
	npx prettier -w --loglevel error .
	npx eslint . --fix
# prod: all
#	npx google-closure-compiler --js build/lib/libv86.js build/assets/libs/filer.min.js build/lib/coreapps/ExternalApp.js build/lib/coreapps/x86MgrApp.js build/lib/coreapps/SettingsApp.js build/lib/coreapps/BrowserApp.js build/lib/v86.js build/lib/AliceWM.js build/lib/AliceJS.js build/lib/Taskbar.js build/lib/ContextMenu.js build/lib/api/ContextMenuAPI.js build/lib/Launcher.js build/lib/Bootsplash.js build/lib/oobe/OobeView.js build/lib/oobe/OobeWelcomeStep.js build/lib/oobe/OobeAssetsStep.js build/lib/Utils.js build/lib/Anura.js build/lib/api/Settings.js build/lib/api/NotificationService.js build/lib/Boot.js --js_output_file public/dist.js
static: all
	mkdir -p static/
	cp -r aboutproxy/static/* static/
	cp -r apps/ static/apps/
	cp -r build/* static/
	cp -r public/* static/ 

server: FORCE
	cd server; npx ts-node server.ts

# v86 imports
v86/src/rust/gen/jit.rs: 
	cd v86; make src/rust/gen/jit.rs
v86/src/rust/gen/jit0f.rs: 
	cd v86; make src/rust/gen/jit0f.rs
v86/src/rust/gen/interpreter.rs: 
	cd v86; make src/rust/gen/interpreter.rs
v86/src/rust/gen/interpreter0f.rs: 
	cd v86; make src/rust/gen/interpreter0f.rs
v86/src/rust/gen/analyzer.rs:
	cd v86; make src/rust/gen/analyzer.rs
v86/src/rust/gen/analyzer0f.rs: 
	cd v86; make src/rust/gen/analyzer0f.rs
v86/build/softfloat.o:
	cd v86; make build/softfloat.o
v86/build/zstddeclib.o:
	cd v86; make build/zstddeclib.o


FORCE: ;
