#!/bin/bash

# 输入： ai1.cpp ai2.cpp output_dir [running_container_name]
# 进行一场比赛

if [ "$#" -lt "3" ]; then
    echo "need args"
    exit -1
fi

ai1_path=`realpath $1`
ai2_path=`realpath $2`
output_dir=`realpath $3`
running_container_name=$4

mkdir -p $output_dir
rm -rf $output_dir
mkdir -p $output_dir

command="sudo docker run --rm"
command="$command -v $ai1_path:/root/code/ai1.cpp:ro"
command="$command -v $ai2_path:/root/code/ai2.cpp:ro"
command="$command -v $PWD/run.py:/root/code/run.py:ro"
command="$command -v $output_dir:/root/output"

# 限制
command="$command --cpus 1"
if [ "$CPUSET" != "" ]; then
    command="$command --cpuset-cpus $CPUSET"
fi
command="$command --memory 1073741824"
command="$command --network none"

if [ "$running_container_name" != "" ]; then
    command="$command --name $running_container_name"
fi

command="$command aiengine:wuziqi python3 /root/code/run.py"

echo command is "\`$command\`"

$command
