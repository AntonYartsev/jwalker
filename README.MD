# JWalker

![GitHub last commit](https://img.shields.io/github/last-commit/antonyartsev/jwalker)
![GitHub](https://img.shields.io/github/license/antonyartsev/jwalker)

`JWalker` is a lightweight parser built upon the Puppeteer framework. The project is designed to provide fast parsing capabilities and efficient alternative to heavyweight solutions like Selenium server for smaller-scale parsing tasks

## Features

- **gRPC Support:** jwalker operates over gRPC, making it compatible with a vast ecosystem of microservices and service meshes.

## Getting Started
Follow these steps to set up the `jwalker` in your project:

### Install

```shell
git clone https://github.com/AntonYartsev/jwalker
cd jwalker
npm install
```

### Environment Setup
```shell
# to use grpc
export GRPC_HOST="0.0.0.0"
export GRPC_PORT="9123"
```

### Run
```shell
# use grpc
npm run serve -- grpc jwalker
```

## Run in container
To development using Docker containers follow these steps

### Build you own image
```shell
# default
docker build -t jwalker .
# apple silicon (tested on m1)
docker build -t jwalker -f DockerfileAppleSilicon .
```

### Run container
```shell
docker run -d -t -p 9123:9123 --name jwalker -v /home/root/jwalker:/src -v /var/run/docker.sock:/var/run/docker.sock jwalker:latest
```

## Deploy in container
To deploy using Docker containers follow these steps

### Build image
```shell
# grpc variant
docker build -t jwalker -f DockerfileDeploymentGRPC .
```

### Run container
```shell
docker run -d -t -p 9123:9123 -e GRPC_HOST="0.0.0.0" -e GRPC_PORT="9123" --name jwalker -v /home/root/jwalker:/src jwalker:latest -v /var/run/docker.sock:/var/run/docker.sock jwalker:latest
```