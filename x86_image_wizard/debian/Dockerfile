FROM i386/debian:bookworm

ENV DEBIAN_FRONTEND noninteractive

RUN apt update && \
    apt --yes --no-install-recommends install \
        linux-image-686 grub2 systemd \
        libterm-readline-perl-perl \
        gcc make libc6-dev \
        unzip bzip2 xz-utils \
        # fluxbox \
        # xserver-xorg-input-kbd xserver-xorg-input-mouse xserver-xorg-input-evdev \
        # xserver-xorg-video-fbdev xserver-xorg-video-vesa \
        # xserver-xorg x11-xserver-utils xinit dbus-x11 \
        # libgdk-pixbuf2.0 libpango-1.0 libpangocairo-1.0 libgtk2.0-bin \
        libc-l10n locales \
        fonts-noto fonts-droid-fallback \
        strace file xterm vim apt-file \
        dhcpcd5 \
        wget curl \
        net-tools \
        mesa-utils libgl1-mesa-dri \
    && \
    touch /root/.Xdefaults && \
    echo "en_US.UTF-8 UTF-8" >> /etc/locale.gen && \
    locale-gen && \
    echo 'LANG="en_US.UTF-8"' > /etc/default/locale && \
    chsh -s /bin/bash && \
    echo "root:root" | chpasswd && \
    # mkdir -p /etc/systemd/system/serial-getty@ttyS0.service.d/ && \
    # systemctl enable serial-getty@ttyS0.service && \
    rm /lib/systemd/system/getty.target.wants/getty-static.service && \
    rm /etc/motd /etc/issue && \
    systemctl disable apt-daily.timer && \
    systemctl disable apt-daily-upgrade.timer && \
    systemctl disable dhcpcd.service && \
    echo "tmpfs /tmp tmpfs nodev,nosuid 0 0" >> /etc/fstab


# COPY getty-noclear.conf getty-override.conf /etc/systemd/system/getty@tty1.service.d/
# COPY getty-autologin-serial.conf /etc/systemd/system/serial-getty@ttyS0.service.d/

COPY logind.conf /etc/systemd/logind.conf

#COPY xinitrc /root/.xinitrc
COPY xorg.conf /etc/X11/
COPY anurad-start.sh /bin/
COPY anura-boot.sh /bin/


COPY anurad.c /etc/

RUN chmod u+x /bin/anura-boot.sh /bin/anurad-start.sh
RUN gcc /etc/anurad.c -o /bin/anurad -lutil
COPY anura-boot.service /etc/systemd/system
COPY anurad.service /etc/systemd/system


RUN systemctl enable anurad
RUN systemctl enable anura-boot
