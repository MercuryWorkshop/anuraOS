FROM i386/alpine:edge

ENV CACHE_BUST=1236

RUN apk add --update \
        alpine-base alpine-conf openrc bash ncurses shadow curl \
        linux-virt linux-headers linux-firmware-none linux-firmware-sb16 \
        gcc make gcompat musl-dev libx11-dev xinit \
        curl bind-tools \
        htop vim nano

RUN setup-xorg-base xhost xterm xcalc xdotool xkill || true
RUN setup-devd udev || true
RUN touch /root/.Xdefaults
RUN rm /etc/motd /etc/issue
RUN setup-hostname anura
RUN passwd -d root
RUN chsh -s /bin/bash
RUN echo "host9p /root 9p defaults 0 0" >> /etc/fstab

COPY xorg.conf /etc/X11/
COPY X11/* /etc/X11/

COPY xfrog.sh /bin/xfrog
COPY xsetrandr.sh /bin/xsetrandr
COPY profile /etc/profile
RUN chmod 644 /etc/profile

COPY anuramouse/* /etc/anuramouse/
COPY interfaces /etc/network/interfaces
COPY epoxy-server /bin/epoxy-server
COPY epoxyconf.toml /etc/epoxyconf.toml

RUN chmod u+x /bin/xfrog /bin/xsetrandr /bin/epoxy-server
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
RUN mkdir -p /etc/apk/commit_hooks.d/
COPY anura-apk /etc/apk/commit_hooks.d/anura-linux.sh
RUN chmod +x /etc/apk/commit_hooks.d/anura-linux.sh
COPY anura-run /bin/anura-run
RUN chmod +x /bin/anura-run

RUN mkinitfs -c /etc/mkinitfs/mkinitfs.conf -b / $(cat /usr/share/kernel/virt/kernel.release)
RUN bash
