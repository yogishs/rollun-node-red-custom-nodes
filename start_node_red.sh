docker build -t node-red-local -f dev.Dockerfile .
docker run --rm -it -p 1880:1880 --name mynodered node-red-local
