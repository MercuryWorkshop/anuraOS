FROM i386/debian:bookworm


ENV DEBIAN_FRONTEND noninteractive

RUN apt update && \
    apt --yes --no-install-recommends install \
        linux-image-686 linux-headers-686 systemd systemd-sysv \
        gcc make libc6-dev libx11-dev \
        unzip bzip2 xz-utils \
        xserver-xorg-core xinit \
        xserver-xorg-input-evdev \
        x11-xserver-utils x11-utils xterm xdotool x11-apps \
        mesa-utils libgl1-mesa-dri \
        libc-l10n locales \
        wget curl dhcpcd5 net-tools openssl ca-certificates \
        strace file vim apt-file \
        fonts-noto fonts-droid-fallback \
        procps \
    && \
    touch /root/.Xdefaults && \
    echo "en_US.UTF-8 UTF-8" >> /etc/locale.gen && \
    locale-gen && \
    echo 'LANG="en_US.UTF-8"' > /etc/default/locale && \
    chsh -s /bin/bash && \
    passwd -d root && \
    rm /lib/systemd/system/getty.target.wants/getty-static.service && \
    rm /etc/motd /etc/issue && \
    systemctl disable apt-daily.timer && \
    systemctl disable apt-daily-upgrade.timer && \
    echo "tmpfs /tmp tmpfs nodev,nosuid 0 0" >> /etc/fstab && \
    echo "host9p /root 9p defaults 0 0" >> /etc/fstab

ARG CACHEBUST=1

COPY logind.conf /etc/systemd/logind.conf

COPY xorg.conf /etc/X11/

COPY xfrog.sh /bin/xfrog
COPY xsetrandr.sh /bin/xsetrandr
COPY ptynet.sh /bin/ptynet

COPY anurad.c /etc/
COPY anuramouse/* /etc/anuramouse/

RUN chmod u+x /bin/xfrog /bin/xsetrandr /bin/ptynet
RUN gcc /etc/anurad.c -o /bin/anurad -lutil
RUN gcc /etc/anuramouse/mouse.c -o /bin/anuramouse -lX11
COPY anurad.service /etc/systemd/system
RUN printf "nameserver 1.1.1.1\nnameserver 1.0.0.1\n" > /etc/resolv.conf.head

RUN echo "RESUME=none" >> /etc/initramfs-tools/conf.d/resume
RUN update-initramfs -u
RUN systemctl enable anurad
RUN systemctl enable dhcpcd
RUN bash
