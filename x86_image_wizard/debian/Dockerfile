FROM i386/debian:bookworm


ENV DEBIAN_FRONTEND noninteractive

RUN apt update && \
    apt --yes --no-install-recommends install \

        linux-image-686 grub2 systemd \
        libterm-readline-perl-perl \
        gcc make libc6-dev \
        unzip bzip2 xz-utils \
        fluxbox \
        xserver-xorg-input-kbd xserver-xorg-input-mouse xserver-xorg-input-evdev xcvt x11-utils x11-apps \
        xserver-xorg-video-fbdev xserver-xorg-video-vesa \
        xserver-xorg x11-xserver-utils xinit dbus-x11 libx11-dev \
        htop iputils-ping \
        libc-l10n locales \
        fonts-noto fonts-droid-fallback \
        strace file xterm vim apt-file \
        dhcpcd5 \
        wget curl \
        net-tools \
        mesa-utils libgl1-mesa-dri \
        openssl \
        libcurl4-openssl-dev \
        npm nodejs \
        xdotool \
        linux-headers-6.1.0-10-686 \
        procps \
    && \
    touch /root/.Xdefaults && \
    echo "en_US.UTF-8 UTF-8" >> /etc/locale.gen && \
    locale-gen && \
    echo 'LANG="en_US.UTF-8"' > /etc/default/locale && \
    chsh -s /bin/bash && \
    passwd -d root && \
    # mkdir -p /etc/systemd/system/serial-getty@ttyS0.service.d/ && \
    # systemctl enable serial-getty@ttyS0.service && \
    rm /lib/systemd/system/getty.target.wants/getty-static.service && \
    rm /etc/motd /etc/issue && \
    systemctl disable apt-daily.timer && \
    systemctl disable apt-daily-upgrade.timer && \
    echo "tmpfs /tmp tmpfs nodev,nosuid 0 0" >> /etc/fstab

ARG CACHEBUST=1

# COPY getty-noclear.conf getty-override.conf /etc/systemd/system/getty@tty1.service.d/
# COPY getty-autologin-serial.conf /etc/systemd/system/serial-getty@ttyS0.service.d/

COPY logind.conf /etc/systemd/logind.conf

#COPY xinitrc /root/.xinitrc
COPY xorg.conf /etc/X11/
COPY anura-boot.sh /bin/

COPY xfrog.sh /bin/xfrog
COPY xsetrandr.sh /bin/xsetrandr
COPY ptynet.sh /bin/ptynet


COPY anurad.c /etc/
COPY anuramouse/* /etc/anuramouse/
# COPY anuramouse/pack.c /etc/anuramouse/
# COPY anuramouse/userdma.c /etc/anuramouse/

RUN chmod u+x /bin/anura-boot.sh /bin/xfrog /bin/xsetrandr /bin/ptynet
RUN gcc /etc/anurad.c -o /bin/anurad -lutil
RUN gcc /etc/anuramouse/mouse.c -o /bin/anuramouse -lX11
COPY anura-boot.service /etc/systemd/system
COPY anurad.service /etc/systemd/system

RUN echo "RESUME=none" >> /etc/initramfs-tools/conf.d/resume
RUN update-initramfs -u
RUN systemctl enable anurad
RUN systemctl enable anura-boot
RUN systemctl enable dhcpcd
RUN bash
