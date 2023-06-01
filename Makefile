all: bundle v86
	true
clean:
	cd v86; make clean
	rm -rf public/build
	rm -rf public/bios
	rm -rf build/*

rootfs:
	echo "not implemented yet, harass coolelectronics if you want the image files"

v86:
	cd v86; make build/libv86.js
	mv v86/build public
	cp -r v86/bios public
	

watch:
	tsc --watch
bundle:
	tsc
