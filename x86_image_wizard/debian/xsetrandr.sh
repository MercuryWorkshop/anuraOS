DISPLAY=:0

cv=$(cvt $1 $2 | tail -1 | tr -d '"')
modename=$(awk '{ print $2 }' <<<$cv)
xrandr -d $DISPLAY --newmode ${cv:9}
xrandr -d $DISPLAY --addmode Virtual-1 "$modename"
xrandr -d $DISPLAY -s "$modename"
