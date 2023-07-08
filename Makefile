RUST_FILES=$(shell find v86/src/rust/ -name '*.rs') \
	   v86/src/rust/gen/interpreter.rs v86/src/rust/gen/interpreter0f.rs \
	   v86/src/rust/gen/jit.rs v86/src/rust/gen/jit0f.rs \
	   v86/src/rust/gen/analyzer.rs v86/src/rust/gen/analyzer0f.rs

all: build/bootstrap v86dirty v86 build/nohost-sw.js bundle

full: all prod rootfs

build/bootstrap:
	mkdir -p build/lib
	npm i
	cd server; npm i
	>build/bootstrap

build/nohost-sw.js:
	cd nohost; npm i; npm run build; cp -r dist/* ../build/
clean:
	cd v86; make clean
	rm -rf build/*

rootfs: FORCE
	cd x86_image_wizard/debian; sh build-debian-bin.sh

v86dirty: 
	touch v86timestamp # makes it "dirty" and forces recompilation

v86: libv86.js public/lib/v86.wasm
	cp -r v86/bios public
	

libv86.js: v86/src/*.js v86/lib/*.js v86/src/browser/*.js
	cd v86; make build/libv86.js
	cp v86/build/libv86.js build/lib/libv86.js

public/lib/v86.wasm: $(RUST_FILES) v86/build/softfloat.o v86/build/zstddeclib.o v86/Cargo.toml
	cd v86; make build/v86.wasm
	cp v86/build/v86.wasm build/lib/v86.wasm

watch: bundle FORCE
	which inotifywait || echo "INSTALL INOTIFYTOOLS"
	shopt -s globstar; while true; do inotifywait -e close_write ./src/**/* &>/dev/null;clear; make tsc css; echo "Done!"; sleep 1; done
tsc:
	mkdir -p build/artifacts
	cp -r src/* build/artifacts
	npx tsc
css: src/*.css
	shopt -s globstar; cat src/**/*.css | npx postcss --use autoprefixer -o build/bundle.css
bundle: tsc css lint
	mkdir -p build/artifacts
lint:
	npx prettier -w --loglevel error .
	npx eslint . --fix
prod: all
	npx google-closure-compiler --js build/assets/libs/filer.min.js build/lib/Taskbar.js build/lib/AliceJS.js build/lib/api/NotificationService.js build/lib/ContextMenu.js build/lib/oobe/OobeAssetsStep.js build/lib/AliceWM.js build/lib/api/Settings.js build/lib/Launcher.js build/lib/oobe/OobeView.js build/lib/libv86.js build/lib/v86.js build/lib/Bootsplash.js build/lib/oobe/OobeWelcomeStep.js build/lib/Anura.js --js_output_file public/dist.js
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
