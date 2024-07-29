export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
export PS1="\[$(tput bold)\]\[$(tput setaf 1)\][\[$(tput setaf 3)\]\u\[$(tput setaf 2)\]@\[$(tput setaf 4)\]\h \[$(tput setaf 5)\]\W\[$(tput setaf 1)\]]\[$(tput setaf 7)\]\\$ \[$(tput sgr0)\]"
export HOME="/root"
export DISPLAY=":0"

export PAGER=less
export EDITOR=vim
umask 022

for script in /etc/profile.d/*.sh ; do
        if [ -r "$script" ] ; then
                . "$script"
        fi
done
unset script