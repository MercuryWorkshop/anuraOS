FROM ljmf00/archlinux:latest

RUN mkdir drivers
COPY xf86-input-keyboard.pkg.tar.xz /drivers
COPY xf86-input-mouse.pkg.tar.xz /drivers
COPY perl-term-readline-perl.pkg.tar.zst /drivers

RUN pacman -Sy && \
    pacman --noconfirm -S  \
        neofetch \
        linux grub systemd \
        gcc make glibc \
        unzip bzip2 xz tar \
        fluxbox \
        xorg-server xorg-xinit xorg-apps dbus \
        xf86-video-fbdev xf86-video-vesa xf86-input-evdev \
        htop \
        noto-fonts ttf-droid \
        strace xterm vim \
        dhcpcd \
        wget curl \
        net-tools \
        mesa-utils libva-mesa-driver \
        xdotool \
    && \
    touch /root/.Xdefaults && \
    pacman --noconfirm -U /drivers/xf86-input-keyboard.pkg.tar.xz /drivers/xf86-input-mouse.pkg.tar.xz /drivers/perl-term-readline-perl.pkg.tar.zst && \
    rm -rf /drivers && \
    yes | pacman -Scc && \
    echo 'LANG="en_US.UTF-8"' > /etc/default/locale && \
    passwd -d root && \
    rm /usr/lib/systemd/system/systemd-networkd* && \
    echo ""

COPY logind.conf /etc/systemd/logind.conf

COPY xorg.conf /etc/X11/
COPY anura-boot.sh /bin/
COPY fstab /etc/

COPY xfrog.sh /bin/xfrog
COPY xsetrandr.sh /bin/xsetrandr


COPY anurad.c /etc/

RUN chmod u+x /bin/anura-boot.sh /bin/xfrog /bin/xsetrandr
RUN cp /usr/lib/systemd/systemd /usr/bin/systemd
RUN df -h
RUN gcc /etc/anurad.c -o /bin/anurad -lutil
RUN rm /usr/lib/systemd/system/systemd-firstboot.service
RUN rm -rf /usr/lib/systemd/system-preset/*
COPY 90-systemd.preset /usr/lib/systemd/system-preset
COPY anura-boot.service /etc/systemd/system
COPY anurad.service /etc/systemd/system
COPY dhcpcd.service /etc/systemd/system
COPY mkinitcpio.conf /etc/


RUN mkinitcpio -P
RUN systemctl enable anurad
RUN systemctl enable anura-boot
RUN systemctl enable dhcpcd
RUN bash
