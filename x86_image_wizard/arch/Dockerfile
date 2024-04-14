FROM ljmf00/archlinux:latest

RUN pacman-key --init

RUN pacman --noconfirm -Sy archlinux32-keyring archlinux-keyring && \
    pacman --noconfirm -S  \
        neofetch \
        linux systemd \
        gcc make glibc \
        unzip bzip2 xz tar \
        xorg-server xorg-xinit \
        xf86-input-evdev \
        xdotool xterm xorg-xhost xorg-xcalc \
        ttf-droid \
        strace vim nano htop \
        dhcpcd net-tools wget curl \
        mesa-utils mesa libva-mesa-driver llvm14-libs \
    && \
    touch /root/.Xdefaults && \
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

RUN rm /usr/lib/systemd/system/systemd-firstboot.service
RUN rm -rf /usr/lib/systemd/system-preset/*

COPY 90-systemd.preset /usr/lib/systemd/system-preset
COPY anurad.service /etc/systemd/system
COPY mkinitcpio.conf /etc/
RUN printf "nameserver 1.1.1.1\nnameserver 1.0.0.1\n" > /etc/resolv.conf.head

RUN mkinitcpio -P   
RUN systemctl enable anurad
RUN systemctl enable dhcpcd
RUN systemctl mask krb5-kadmind
RUN systemctl mask krb5-kdc
RUN bash
