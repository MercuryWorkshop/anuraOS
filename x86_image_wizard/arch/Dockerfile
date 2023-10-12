FROM ljmf00/archlinux

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
        xorg-server xorg-xinit xorg-apps xorg-xcalc dbus \
        xf86-video-fbdev xf86-video-vesa xf86-input-evdev \
        htop \
        ttf-droid \
        strace xterm vim perl nano  \
        dhcpcd \
        wget curl \
        net-tools \
        mesa-utils mesa libva-mesa-driver llvm14-libs \
        xdotool \
    && \
    touch /root/.Xdefaults && \
    pacman --noconfirm -Rnsdd xf86-input-libinput && \
    pacman --noconfirm --overwrite "*" -U /drivers/xf86-input-keyboard.pkg.tar.xz /drivers/xf86-input-mouse.pkg.tar.xz /drivers/perl-term-readline-perl.pkg.tar.zst && \
    rm -rf /drivers && \
    yes | pacman -Scc && \
    echo 'LANG="en_US.UTF-8"' > /etc/default/locale && \
    passwd -d root && \
    rm /usr/lib/systemd/system/systemd-networkd* && \
    echo "tmpfs /tmp tmpfs nodev,nosuid 0 0" >> /etc/fstab && \
    echo "host9p /root 9p defaults 0 0" >> /etc/fstab

COPY logind.conf /etc/systemd/logind.conf

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

RUN cp /usr/lib/systemd/systemd /usr/bin/systemd
RUN rm /usr/lib/systemd/system/systemd-firstboot.service
RUN rm -rf /usr/lib/systemd/system-preset/*
RUN rm /usr/lib/dhcpcd/dhcpcd-hooks/20-resolv.conf

COPY dhcpcd.exit-hook /etc/dhcpcd.exit-hook
COPY 90-systemd.preset /usr/lib/systemd/system-preset
COPY anurad.service /etc/systemd/system
COPY mkinitcpio.conf /etc/

RUN mkinitcpio -P   
RUN systemctl enable anurad
RUN systemctl enable dhcpcd
RUN systemctl mask krb5-kadmind
RUN systemctl mask krb5-kdc
RUN bash
