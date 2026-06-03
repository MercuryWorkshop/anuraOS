SHELL := bash

RUST_FILES=$(shell find external/v86/src/rust/ -name '*.rs') \
	   external/v86/src/rust/gen/interpreter.rs external/v86/src/rust/gen/interpreter0f.rs \
	   external/v86/src/rust/gen/jit.rs external/v86/src/rust/gen/jit0f.rs \
	   external/v86/src/rust/gen/analyzer.rs external/v86/src/rust/gen/analyzer0f.rs

all: submodules build/bootstrap \
		external-libs v86 \
	 	bin/chimerix.ajs external/anura-browserjs/packages/chrome/dist/index.html apps/libfileview.lib/icons \
		bundle \
		public/config.json \

full: all rootfs-alpine

hooks: FORCE
	mkdir -p .git/hooks
	echo -e "#!/bin/sh\nmake lint\ngit update-index --again" > .git/hooks/pre-commit
	chmod +x .git/hooks/pre-commit

submodules: .gitmodules
	git submodule update --recursive

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

external-libs: build/libs/workbox/version build/libs/mime/mime.iife.js build/libs/idb-keyval/idb-keyval.js build/libs/comlink/comlink.min.mjs build/assets/matter.css build/libs/dreamland/all.js build/libs/filer/filer.min.js build/libs/nfsadapter/nfsadapter.js build/libs/fflate/browser.js build/libs/libcurl/version bin/chimerix.ajs
	mkdir -p build/libs/
	
build/libs/workbox/version: build/bootstrap
	mkdir -p build/libs/workbox
	npx workbox-cli copyLibraries build/libs/workbox/
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

build/libs/comlink/comlink.min.mjs: build/bootstrap
	mkdir -p build/libs/comlink
	cp node_modules/comlink/dist/esm/comlink.min.mjs build/libs/comlink/comlink.min.mjs
	cp node_modules/comlink/dist/esm/comlink.min.mjs.map build/libs/comlink/comlink.min.mjs.map
	cp node_modules/comlink/dist/umd/comlink.min.js build/libs/comlink/comlink.min.umd.js
	cp node_modules/comlink/dist/umd/comlink.min.js.map build/libs/comlink/comlink.min.umd.js.map
	sed -i build/libs/comlink/comlink.min.umd.js -e 's|//# sourceMappingURL=comlink.min.js.map|//# sourceMappingURL=comlink.min.umd.js.map|'
	jq '.version' node_modules/comlink/package.json > build/libs/comlink/version

build/assets/matter.css:
	mkdir -p build/assets
	curl https://github.com/finnhvman/matter/releases/latest/download/matter.css -L -o build/assets/matter.css

build/libs/dreamland/all.js: build/bootstrap
	mkdir -p build/libs/dreamland
	cp node_modules/dreamland/dist/all.js build/libs/dreamland/all.js
	cp node_modules/dreamland/dist/all.js.map build/libs/dreamland/all.js.map
	jq '.version' node_modules/dreamland/package.json > build/libs/dreamland/version

build/libs/filer/filer.min.js: build/bootstrap
	mkdir -p build/libs/filer
	cp node_modules/filer/dist/filer.min.js build/libs/filer/filer.min.js
	cp node_modules/filer/dist/filer.min.js.map build/libs/filer/filer.min.js.map
	jq '.version' node_modules/filer/package.json > build/libs/filer/version

build/libs/nfsadapter/nfsadapter.js: external/native-file-system-adapter/src/es6.js external/native-file-system-adapter/src/adapters/filer.js
	cd external/native-file-system-adapter; npm i; npm run build
	mkdir -p build/libs/nfsadapter
	mkdir -p build/libs/nfsadapter/adapters
	cp external/native-file-system-adapter/dist/output.js build/libs/nfsadapter/nfsadapter.js
	cp external/native-file-system-adapter/src/adapters/filer.js build/libs/nfsadapter/adapters/anuraadapter.js
	cp external/native-file-system-adapter/src/util.js build/libs/nfsadapter/
	cp external/native-file-system-adapter/src/config.js build/libs/nfsadapter/	

build/libs/fflate/browser.js: build/bootstrap
	mkdir -p build/libs/fflate
	cp node_modules/fflate/esm/browser.js build/libs/fflate/browser.js
	jq '.version' node_modules/fflate/package.json > build/libs/fflate/version

build/libs/libcurl/version: build/bootstrap
	mkdir -p build/libs/libcurl
	cp node_modules/libcurl.js/libcurl.mjs build/libs/libcurl/libcurl.mjs
	cp node_modules/libcurl.js/libcurl.wasm build/libs/libcurl/libcurl.wasm
	jq '.version' node_modules/libcurl.js/package.json > build/libs/libcurl/version
	
# v86 imports
external/v86/src/rust/gen/jit.rs: 
	cd external/v86; make src/rust/gen/jit.rs
external/v86/src/rust/gen/jit0f.rs: 
	cd external/v86; make src/rust/gen/jit0f.rs
external/v86/src/rust/gen/interpreter.rs: 
	cd external/v86; make src/rust/gen/interpreter.rs
external/v86/src/rust/gen/interpreter0f.rs: 
	cd external/v86; make src/rust/gen/interpreter0f.rs
external/v86/src/rust/gen/analyzer.rs:
	cd external/v86; make src/rust/gen/analyzer.rs
external/v86/src/rust/gen/analyzer0f.rs: 
	cd external/v86; make src/rust/gen/analyzer0f.rs
external/v86/build/softfloat.o:
	cd external/v86; make build/softfloat.o
external/v86/build/zstddeclib.o:
	cd external/v86; make build/zstddeclib.o

libv86.js: external/v86/src/*.js external/v86/lib/*.js external/v86/src/browser/*.js
	cd external/v86; make build/libv86.js
	cp external/v86/build/libv86.js build/lib/libv86.js

build/lib/v86.wasm: $(RUST_FILES) external/v86/build/softfloat.o external/v86/build/zstddeclib.o external/v86/Cargo.toml
	cd external/v86; make build/v86.wasm
	cp external/v86/build/v86.wasm build/lib/v86.wasm
	
v86: libv86.js build/lib/v86.wasm
	cp -r external/v86/bios public

bin/chimerix.ajs: external/chimerix/src/*
	mkdir -p build/bin
	cd external/chimerix; npm i
	cd external/chimerix; npx rollup -c rollup.config.js
	cp external/chimerix/dist/chimerix.ajs bin/chimerix.ajs

external/anura-browserjs/packages/chrome/dist/index.html: external/anura-browserjs/packages/chrome/package.json external/anura-browserjs/packages/chrome/src/*.ts external/anura-browserjs/packages/chrome/src/*.tsx external/anura-browserjs/packages/scramjet/package.json external/anura-browserjs/packages/scramjet/packages/core/src/*.ts
	cd external/anura-browserjs; pnpm i
	cd external/anura-browserjs/packages/scramjet/packages/core; pnpm rewriter:build
	cd external/anura-browserjs; pnpm build && pnpm build:dreamland
	cd external/anura-browserjs/packages/chrome; pnpm build

apps/libfileview.lib/icons: apps/libfileview.lib/icons.json
	cd apps/libfileview.lib; bash geticons.sh

ANURA_VERSION = $(shell jq -r '.version' package.json)

bundle: tsc css lint milestone commit build/cache-load.json
	mkdir -p build/artifacts
	
clean:
	rm -rf build
	cd v86 && make clean || true

watch: FORCE
	npx tsc-watch --onSuccess "make css milestone commit build/cache-load.json" 

tsc:
	mkdir -p build/artifacts
	cp -r src/* build/artifacts
	npx tsc
	mkdir -p anuraos-types
	cd anuraos-types/; \
	mkdir -p lib/
	cd build/; \
	(find lib -type f -name "*.d.ts" -exec cp --parents {} ../anuraos-types/ \;)
	(cd build && find lib -type f -name "*.d.ts") | sed 's/ \+/\n/g' | sed 's|.*|/// <reference path="&" />|' > anuraos-types/index.d.ts
	jq 'del(.dependencies, .devDependencies) | .name = "@mercuryworkshop/anuraos-types" | .description = "Type declarations for anuraOS" | .types = "index.d.ts"' package.json > anuraos-types/package.json
css: src/*.css
	# shopt -s globstar; cat src/**/*.css | npx postcss --use autoprefixer -o build/bundle.css
	shopt -s globstar; cat src/**/*.css > build/bundle.css
lint:
	npx prettier -w --log-level error .
	npx eslint . --fix
milestone:
	uuidgen > build/MILESTONE
commit:
	git rev-parse HEAD > build/COMMIT
build/cache-load.json: FORCE
	(find apps/ -type f && cd build/ && find lib/ -type f && find libs/ -type f && find uv/ -type f && find assets/ -type f && find bundle.css -type f && cd ../public/ && find . -type f)| grep -v -e node_modules -e \.map -e \.d\.ts -e "/\." -e "uv/" -e "workbox/" | jq -Rnc '[inputs]' > build/cache-load.json
	
static: all
	mkdir -p static/
	cp -r public/* static/
	cp -r build/* static/
	cp -r bin/* static/bin/
	cp -r apps/* static/apps/
	cp -r external/anura-browserjs/packages/chrome/dist/* static/browser/

server: FORCE
	cd server; node server.js

rootfs: FORCE
	cd x86_image_wizard; sh x86_image_wizard.sh

rootfs-alpine: FORCE
	cd x86_image_wizard/alpine; sh build-alpine-bin.sh

public/config.json:
	cp config.default.json public/config.json

FORCE: ;
