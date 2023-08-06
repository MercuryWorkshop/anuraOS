FROM ljmf00/archlinux:latest

RUN pacman -Sy && \
    pacman --noconfirm -S  \
        base base-devel btrfs-progs \
        linux grub systemd \
        gcc make glibc \
        unzip bzip2 xz tar \
        fluxbox \
        xorg xorg-xinit dbus \
        xf86-video-fbdev xf86-video-vesa xf86-input-evdev \
        htop \
        noto-fonts ttf-droid \
        strace xterm vim \
        dhcpcd \
        wget curl \
        net-tools \
        mesa-utils libva-mesa-driver \
        openssl \
        npm nodejs \
        xdotool \
        linux-headers \
    && \
    touch /root/.Xdefaults && \
    echo "en_US.UTF-8 UTF-8" >> /etc/locale.gen && \
    locale-gen && \
    echo 'LANG="en_US.UTF-8"' > /etc/default/locale && \
    # chsh -s /bin/bash && \
    passwd -d root && \
    # mkdir -p /etc/systemd/system/serial-getty@ttyS0.service.d/ && \
    # systemctl enable serial-getty@ttyS0.service && \
    rm /etc/systemd/system/getty.target.wants/getty@tty1.service && \
    # systemctl disable getty@tty1.service && \
    # rm /lib/systemd/system/getty.target.wants/getty-static.service && \
    # rm /etc/motd /etc/issue && \
    echo ""

RUN yes | pacman -Scc

ARG CACHEBUST=1

# COPY getty-noclear.conf getty-override.conf /etc/systemd/system/getty@tty1.service.d/
# COPY getty-autologin-serial.conf /etc/systemd/system/serial-getty@ttyS0.service.d/

COPY logind.conf /etc/systemd/logind.conf

#COPY xinitrc /root/.xinitrc
COPY xorg.conf /etc/X11/
COPY anura-boot.sh /bin/
COPY fstab /etc/

COPY xfrog.sh /bin/xfrog
COPY xsetrandr.sh /bin/xsetrandr


COPY anurad.c /etc/

RUN chmod u+x /bin/anura-boot.sh /bin/xfrog /bin/xsetrandr
RUN cp /usr/lib/systemd/systemd /usr/bin/systemd
RUN lsblk
RUN gcc /etc/anurad.c -o /bin/anurad -lutil
RUN rm /usr/lib/systemd/system/systemd-firstboot.service
COPY anura-boot.service /usr/lib/systemd/system
COPY anurad.service /usr/lib/systemd/system
COPY mkinitcpio.conf /etc/


# RUN echo "RESUME=none" >> /etc/initramfs-tools/conf.d/resume
RUN mkinitcpio -P
RUN systemctl enable anurad
RUN systemctl enable anura-boot
RUN systemctl enable dhcpcd
RUN bash
