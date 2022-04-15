#!/bin/bash

set -x

sudo docker rmi aiengine:wuziqi
sudo docker build -t aiengine:wuziqi .
