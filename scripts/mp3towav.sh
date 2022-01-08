for i in $(seq -f "%02g" 1 39)
do
  mpg123 mp3/$i.mp3 -w wav/$i.wav
done
