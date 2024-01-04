#!/bin/sh

build_alpine() {
    cd alpine
    sh build-alpine-bin.sh
    cd ..
}

build_debian() {
    cd debian
    sh build-debian-bin.sh
    cd ..
}

build_arch() {
    cd arch
    sh build-arch-bin.sh
    cd ..
}

display_menu() {
    echo "Choose a rootfs image to build:"
    echo "1. Alpine"
    echo "2. Debian"
    echo "3. Arch"
    echo "4. All"
    echo "0. Exit"
}

process_choice() {
    case "$1" in
        1)
            build_alpine
            ;;
        2)
            build_debian
            ;;
        3)
            build_arch
            ;;
        4)
            echo "Building all rootfs images..."
            build_alpine
            build_debian
            build_arch
            ;;
        0)
            echo "Exiting..."
            exit 0
            ;;
        *)
            echo "Invalid choice. Please try again."
            ;;
    esac
}

while true; do
    display_menu
    read -p "Enter your choice: " choice
    process_choice "$choice"
    echo ""
done
