#!/bin/sh
while ! ip link | grep -q "enp0s5"; do
    echo "interface not found. waiting"
    sleep 5
done

dhcpcd -b