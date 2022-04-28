#!/bin/bash

set -ex

rsync -av --exclude server/config.yml --exclude data ./ aiplatform:~/aiplatform
