FROM ubuntu:20.04

RUN apt update && apt install -y \
    gcc g++ \
    python3 python3-numpy \
    && rm -rf /var/lib/apt/lists/*

RUN useradd -m -U -u 1001 ai1
RUN useradd -m -U -u 1002 ai2

WORKDIR /root
