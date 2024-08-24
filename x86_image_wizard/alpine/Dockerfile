FROM i386/alpine:edge

RUN  apk add --update \
        alpine-base openrc alpine-conf bash ncurses shadow curl \
        linux-lts linux-firmware-none linux-firmware-sb16 linux-headers \
        gcc make gcompat musl-dev libx11-dev xinit \
        bind-tools \
        htop vim nano \
    && \
    setup-xorg-base xhost xterm xcalc xdotool xkill || true && \
    setup-devd udev || true && \
    touch /root/.Xdefaults && \
    rm /etc/motd /etc/issue && \
    setup-hostname anura && \
    passwd -d root && \
    chsh -s /bin/bash && \
    echo "host9p /root 9p defaults 0 0" >> /etc/fstab

COPY xorg.conf /etc/X11/
COPY X11/* /etc/X11/

COPY xfrog.sh /bin/xfrog
COPY xsetrandr.sh /bin/xsetrandr
COPY profile /etc/profile
RUN chmod 644 /etc/profile

COPY anuramouse/* /etc/anuramouse/
COPY interfaces /etc/network/interfaces
COPY twisp /bin/twisp

RUN chmod u+x /bin/xfrog /bin/xsetrandr /bin/twisp
RUN gcc /etc/anuramouse/mouse.c -o /bin/anuramouse -lX11
COPY twisp-service /etc/init.d/
COPY anura-boot /etc/init.d/
RUN chmod +x /etc/init.d/twisp-service /etc/init.d/anura-boot

# setup init system
COPY rc.conf /etc/rc.conf

RUN for i in dmesg anura-boot; do rc-update add $i sysinit; done
RUN for i in hwclock modules sysctl hostname syslog bootmisc; do rc-update add $i boot; done
RUN rc-update add killprocs shutdown
RUN rc-update add twisp-service default

COPY mkinitfs.conf /etc/mkinitfs/mkinitfs.conf
RUN mkinitfs -c /etc/mkinitfs/mkinitfs.conf -b / $(cat /usr/share/kernel/lts/kernel.release)
RUN bash