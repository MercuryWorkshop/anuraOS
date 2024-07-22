SHELL := bash

RUST_FILES=$(shell find v86/src/rust/ -name '*.rs') \
	   v86/src/rust/gen/interpreter.rs v86/src/rust/gen/interpreter0f.rs \
	   v86/src/rust/gen/jit.rs v86/src/rust/gen/jit0f.rs \
	   v86/src/rust/gen/analyzer.rs v86/src/rust/gen/analyzer0f.rs

all: submodules build/bootstrap v86dirty v86 build/libs/mime/mime.iife.js build/libs/filer/filer.min.js build/libs/comlink/comlink.min.mjs build/libs/workbox/version build/libs/fflate/browser.js bundle public/config.json build/cache-load.json apps/libfileview.lib/icons bin/chimerix.ajs build/libs/libcurl/version build/libs/bare-mux/bare.cjs build/libs/idb-keyval/idb-keyval.js build/assets/matter.css build/libs/dreamland/all.js

full: all rootfs-debian rootfs-arch rootfs-alpine

submodules: .gitmodules
	git submodule update

hooks: FORCE
	mkdir -p .git/hooks
	echo -e "#!/bin/sh\nmake lint\ngit add -A" > .git/hooks/pre-commit
	chmod +x .git/hooks/pre-commit

apps/libfileview.lib/icons: apps/libfileview.lib/icons.json
	cd apps/libfileview.lib; bash geticons.sh

bin/chimerix.ajs: chimerix/*
	mkdir -p bin
	cd chimerix; npm i
	cd chimerix; npx rollup -c rollup.config.js
	cp chimerix/dist/chimerix.ajs bin/chimerix.ajs

public/config.json:
	cp config.default.json public/config.json

build/bootstrap: package.json server/package.json
	mkdir -p build/lib
	npm i
	cd server; npm i
	make hooks
	>build/bootstrap

# Each dependency should have a similar structure to the following:
#   build/libs/<libname>/<bundle>.min.js
#   build/libs/<libname>/<bundle>.min.js.map
#   build/libs/<libname>/version (contains version number as JSON string, e.g. "1.2.3")

build/libs/libcurl/version: build/bootstrap
	mkdir -p build/libs/libcurl
	cp node_modules/libcurl.js/libcurl.mjs build/libs/libcurl/libcurl.mjs
	cp node_modules/libcurl.js/libcurl.wasm build/libs/libcurl/libcurl.wasm
	jq '.version' node_modules/libcurl.js/package.json > build/libs/libcurl/version

build/libs/filer/filer.min.js: build/bootstrap
	mkdir -p build/libs/filer
	cp node_modules/filer/dist/filer.min.js build/libs/filer/filer.min.js
	cp node_modules/filer/dist/filer.min.js.map build/libs/filer/filer.min.js.map
	jq '.version' node_modules/filer/package.json > build/libs/filer/version

build/libs/comlink/comlink.min.mjs: build/bootstrap
	mkdir -p build/libs/comlink
	cp node_modules/comlink/dist/esm/comlink.min.mjs build/libs/comlink/comlink.min.mjs
	cp node_modules/comlink/dist/esm/comlink.min.mjs.map build/libs/comlink/comlink.min.mjs.map
	cp node_modules/comlink/dist/umd/comlink.min.js build/libs/comlink/comlink.min.umd.js
	cp node_modules/comlink/dist/umd/comlink.min.js.map build/libs/comlink/comlink.min.umd.js.map
	sed -i build/libs/comlink/comlink.min.umd.js -e 's|//# sourceMappingURL=comlink.min.js.map|//# sourceMappingURL=comlink.min.umd.js.map|'
	jq '.version' node_modules/comlink/package.json > build/libs/comlink/version

build/libs/workbox/version: build/bootstrap
	mkdir -p build/libs/workbox
	npx workbox-cli@7.1.0 copyLibraries build/libs/workbox/
	jq '.version' node_modules/workbox-build/package.json > build/libs/workbox/version

build/libs/mime/mime.iife.js: build/bootstrap
	mkdir -p build/libs/mime
	cp -r node_modules/mime/dist/* build/libs/mime 
	npx rollup -f iife build/libs/mime/src/index.js -o build/libs/mime/mime.iife.js -n mime --exports named
	jq '.version' node_modules/mime/package.json > build/libs/mime/version

build/libs/idb-keyval/idb-keyval.js: build/bootstrap
	mkdir -p build/libs/idb-keyval
	cp node_modules/idb-keyval/dist/umd.js build/libs/idb-keyval/idb-keyval.js
	jq '.version' node_modules/idb-keyval/package.json > build/libs/idb-keyval/version

build/libs/bare-mux/bare.cjs: build/bootstrap
	mkdir -p build/libs/bare-mux
	cp node_modules/@mercuryworkshop/bare-mux/dist/bare.cjs build/libs/bare-mux/bare.cjs
	cp node_modules/@mercuryworkshop/bare-mux/dist/bare.cjs.map build/libs/bare-mux/bare.cjs.map
	jq '.version' node_modules/@mercuryworkshop/bare-mux/package.json > build/libs/bare-mux/version

build/libs/fflate/browser.js: build/bootstrap
	mkdir -p build/libs/fflate
	cp node_modules/fflate/esm/browser.js build/libs/fflate/browser.js
	jq '.version' node_modules/fflate/package.json > build/libs/fflate/version

build/libs/dreamland/all.js: dreamlandjs/src/*
	mkdir -p build/libs/dreamland
	cd dreamlandjs; npm i --no-package-lock --legacy-peer-deps; npm run build
	cp dreamlandjs/dist/all.js build/libs/dreamland/all.js
	cp dreamlandjs/dist/all.js.map build/libs/dreamland/all.js.map
	jq '.version' dreamlandjs/package.json > build/libs/dreamland/version

build/assets/matter.css:
	mkdir -p build/assets
	curl https://github.com/finnhvman/matter/releases/latest/download/matter.css -L -o build/assets/matter.css

clean:
	rm -rf build
	cd v86 && make clean || true

# rootfs-debian: FORCE
#	cd x86_image_wizard/debian; sh build-debian-bin.sh

# rootfs-arch: FORCE
# 	cd x86_image_wizard/arch; sh build-arch-bin.sh

rootfs-alpine: FORCE
	cd x86_image_wizard/alpine; sh build-alpine-bin.sh

rootfs: FORCE
	cd x86_image_wizard; sh x86_image_wizard.sh

v86dirty: 
	touch v86timestamp # makes it "dirty" and forces recompilation

v86: libv86.js build/lib/v86.wasm
	cp -r v86/bios public

build/cache-load.json: FORCE
	(find apps/ -type f && find bin/ -type f && cd build/ && find lib/ -type f && find libs/ -type f && find assets/ -type f && find bundle.css -type f && cd ../public/ && find . -type f)| grep -v -e node_modules -e .map -e "/\." | jq -Rnc '[inputs]' > build/cache-load.json

libv86.js: v86/src/*.js v86/lib/*.js v86/src/browser/*.js
	cd v86; make build/libv86.js
	cp v86/build/libv86.js build/lib/libv86.js

build/lib/v86.wasm: $(RUST_FILES) v86/build/softfloat.o v86/build/zstddeclib.o v86/Cargo.toml
	cd v86; make build/v86.wasm
	cp v86/build/v86.wasm build/lib/v86.wasm

watch: bundle FORCE
	npx tsc-watch --onSuccess "make css build/cache-load.json milestone" 
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
	npx prettier -w --log-level error .
	npx eslint . --fix
# prod: all
#	npx google-closure-compiler --js build/lib/libv86.js build/assets/libs/filer.min.js build/lib/coreapps/ExternalApp.js build/lib/coreapps/x86MgrApp.js build/lib/coreapps/SettingsApp.js build/lib/coreapps/BrowserApp.js build/lib/v86.js build/lib/AliceWM.js build/lib/AliceJS.js build/lib/Taskbar.js build/lib/ContextMenu.js build/lib/api/ContextMenuAPI.js build/lib/Launcher.js build/lib/Bootsplash.js build/lib/oobe/OobeView.js build/lib/oobe/OobeWelcomeStep.js build/lib/oobe/OobeAssetsStep.js build/lib/Utils.js build/lib/Anura.js build/lib/api/Settings.js build/lib/api/NotificationService.js build/lib/Boot.js --js_output_file public/dist.js
static: all
	mkdir -p static/
	cp -r aboutproxy/static/* static/
	cp -r apps/ static/apps/
	cp -r build/* static/
	cp -r public/* static/ 
	cp -r bin/* static/bin/

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
