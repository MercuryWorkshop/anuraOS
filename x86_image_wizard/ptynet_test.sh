rm testpipe || :
mkfifo testpipe ||:
./a.out <testpipe &
pid=$!

while true; do
  cat <<-EOF >>testpipe
http://localhost:8000

GET

EOF
  
  # exit
  # kill -9 $pid
  sleep 4
done

rm testpipe


