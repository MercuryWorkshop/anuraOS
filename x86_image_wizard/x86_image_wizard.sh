#!/bin/sh

display_menu() {
    echo "Choose a rootfs image to build:"
    echo "1. Debian"
    echo "2. Arch"
    echo "0. Exit"
}

process_choice() {
    case "$1" in
        1)
            cd debian
            sh build-debian-bin.sh
            cd ../../
            exit 0
            ;;
        2)
            cd arch
            sh build-arch-bin.sh
            cd ../../
            exit 0
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
