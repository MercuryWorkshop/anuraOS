FROM i386/alpine:edge

RUN  apk add --update \
        alpine-base bash ncurses shadow curl \
        linux-lts linux-firmware-none linux-headers \
        gcc make gcompat musl-dev libx11-dev xinit \
        bind-tools \
        htop vim nano \
    && \
    setup-xorg-base xhost xterm xcalc xdotool xkill || true && \
    setup-devd udev || true && \
    touch /root/.Xdefaults && \
    rm /etc/motd /etc/issue && \
    passwd -d root && \
    chsh -s /bin/bash

COPY xorg.conf /etc/X11/
COPY X11/* /etc/X11/

COPY xfrog.sh /bin/xfrog
COPY xsetrandr.sh /bin/xsetrandr
COPY profile /etc/profile
RUN chmod 644 /etc/profile

COPY anurad.c /etc/
COPY anuramouse/* /etc/anuramouse/
COPY interfaces /etc/network/interfaces
COPY whisper /bin/whisper
COPY twisp /bin/twisp

RUN chmod u+x /bin/xfrog /bin/xsetrandr /bin/whisper /bin/twisp
RUN gcc /etc/anurad.c -o /bin/anurad -lutil 
RUN gcc /etc/anuramouse/mouse.c -o /bin/anuramouse -lX11
COPY anurad /etc/init.d/
COPY anura-boot /etc/init.d/
RUN chmod +x /etc/init.d/anurad /etc/init.d/anura-boot

# setup init system
COPY rc.conf /etc/rc.conf
RUN rc-update add dmesg sysinit
RUN rc-update add anura-boot sysinit
RUN rc-update add udev sysinit
RUN rc-update add udev-trigger sysinit
RUN rc-update add udev-settle sysinit

RUN rc-update add root boot
RUN rc-update add localmount boot
RUN rc-update add modules boot
RUN rc-update add sysctl boot
RUN rc-update add bootmisc boot
RUN rc-update add syslog boot

RUN rc-update add mount-ro shutdown
RUN rc-update add killprocs shutdown
RUN rc-update add savecache shutdown

RUN rc-update add udev-postmount default
RUN rc-update add anurad default

RUN bash