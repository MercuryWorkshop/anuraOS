#!/bin/sh
mount -t 9p host9p /root &
while ! ip link | grep -q "enp0s5"; do
    echo "interface not found. waiting"
    sleep 5
done

ifconfig enp0s5 192.168.1.5 netmask 255.255.255.0 up
route add default gw 192.168.1.1
echo "nameserver 8.8.8.8" > /etc/resolv.conf