FROM ubuntu:20.04

RUN apt update && apt install -y \
    gcc g++ \
    python3 python3-numpy \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /root
