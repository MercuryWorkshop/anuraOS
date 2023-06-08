RUST_FILES=$(shell find v86/src/rust/ -name '*.rs') \
	   v86/src/rust/gen/interpreter.rs v86/src/rust/gen/interpreter0f.rs \
	   v86/src/rust/gen/jit.rs v86/src/rust/gen/jit0f.rs \
	   v86/src/rust/gen/analyzer.rs v86/src/rust/gen/analyzer0f.rs

all: v86dirty v86 bundle

clean:
	cd v86; make clean
	rm -rf build/*

rootfs:
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

watch:
	mkdir -p build/artifacts
	npx tsc-watch --onSuccess "bash -c 'cp -r src/* build/artifacts'"
bundle:
	mkdir -p build/artifacts
	cp -r src/* build/artifacts
	tsc
prod: all
	npx google-closure-compiler --js "build/lib/libv86.js" "public/assets/libs/filer.min.js" "build/lib/**/*.js" --js_output_file public/dist.js



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
