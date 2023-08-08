#!/bin/sh
mount -t 9p host9p /root &
modprobe ne2k-pci
ifconfig enp0s5 192.168.1.5 netmask 255.255.255.0 up
ifconfig enp0s5 192.168.1.5 netmask 255.255.255.0 up
route add default gw 192.168.1.1
route add default gw 192.168.1.1
echo "nameserver 8.8.8.8" > /etc/resolv.conf