FROM i386/alpine:edge

RUN  apk add --update \
        alpine-base bash shadow \
        linux-lts linux-firmware-none linux-headers \
        gcc make gcompat musl-dev libx11-dev \
        dhcpcd \
        htop vim nano \
    && \
    setup-xorg-base xhost xterm xcalc xdotool xkill || true && \
    setup-devd udev || true && \
    touch /root/.Xdefaults && \
    passwd -d root && \
    chsh -s /bin/bash && \
    mkdir -p /etc/openrc/conf.d && echo hostname="anuraos" > /etc/openrc/conf.d/hostname && \
    rm /etc/motd /etc/issue

ARG CACHEBUST=1

COPY xorg.conf /etc/X11/
COPY X11/* /etc/X11/

COPY xfrog.sh /bin/xfrog
COPY xsetrandr.sh /bin/xsetrandr
COPY ptynet.sh /bin/ptynet


COPY anurad.c /etc/
COPY anuramouse/* /etc/anuramouse/

RUN chmod u+x /bin/xfrog /bin/xsetrandr /bin/ptynet
RUN gcc /etc/anurad.c -o /bin/anurad -lutil
RUN gcc /etc/anuramouse/mouse.c -o /bin/anuramouse -lX11
COPY anurad /etc/init.d/
COPY anura-boot /etc/init.d/
RUN chmod +x /etc/init.d/anurad /etc/init.d/anura-boot
RUN printf "nameserver 8.8.8.8\nnameserver 8.8.4.4\n" > /etc/resolv.conf.head

# setup init system
RUN rc-update add devfs sysinit
RUN rc-update add dmesg sysinit
RUN rc-update add anura-boot sysinit

RUN rc-update add root boot
RUN rc-update add localmount boot
RUN rc-update add modules boot
RUN rc-update add sysctl boot
RUN rc-update add hostname boot
RUN rc-update add bootmisc boot
RUN rc-update add syslog boot

RUN rc-update add mount-ro shutdown
RUN rc-update add killprocs shutdown
RUN rc-update add savecache shutdown

RUN rc-update add anurad default

RUN bash