@ECHO off
REM Remove unnecessary images (save space)
docker image prune -a -f
REM Create docker container image
docker build -t questwarsapp .
REM Build and start the docker instances using the image created before
docker-compose up