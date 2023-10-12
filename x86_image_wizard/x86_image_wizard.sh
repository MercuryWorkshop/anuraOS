#!/bin/sh

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
    echo "1. Debian"
    echo "2. Arch"
    echo "3. All"
    echo "0. Exit"
}

process_choice() {
    case "$1" in
        1)
            build_debian
            ;;
        2)
            build_arch
            ;;
        3)
            echo "Building all rootfs images..."
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
