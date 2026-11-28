#!/bin/bash
# Финальная склейка: видео + голос + тихая подложка (Kevin MacLeod, CC BY: Lightless Dawn, Long Note Four), громкость -14 LUFS.
set -e
M=../../assets/music
D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 vo_all.wav)
ffmpeg -loglevel error -y -i "$M/Lightless_Dawn.mp3" -i "$M/Long_Note_Four.mp3" -filter_complex \
 "[0][1]acrossfade=d=6,aloop=loop=-1:size=2e9,atrim=0:$D,afade=t=in:d=3,afade=t=out:st=$(python3 -c "print($D-4)"):d=4,loudnorm=I=-34:TP=-8[m]" -map "[m]" -ar 48000 music_bed.wav
ffmpeg -loglevel error -y -i video_noaudio.mp4 -i vo_all.wav -i music_bed.wav -filter_complex \
 "[1]loudnorm=I=-16:TP=-1.5[v];[v][2]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-14:TP=-1.0[a]" \
 -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -movflags +faststart -shortest ep01_blackout.mp4
ls -la ep01_blackout.mp4
