"""
输出的文件：
* /root/code/ai1.exe
* /root/output/ai1.compile_log
* /root/code/ai2.exe
* /root/output/ai2.compile_log
* /root/output/moves.json
* /root/output/result.json
* /root/output/error.txt
"""

import subprocess
import os
import sys
import shlex
from enum import Enum
import json
import traceback


class Win(Enum):
    TIE = 0
    AI1_WIN = 1
    AI2_WIN = 2


class Result(Exception):
    def __init__(self, win: Win, message: str) -> None:
        super().__init__()
        self.win = win
        self.message = message


def main():
    for num, win in [(1, Win.AI2_WIN), (2, Win.AI1_WIN)]:
        try:
            subprocess.run(
                shlex.split(f"g++ --std=c++14 -O2 /root/code/ai{num}.cpp -o /root/code/ai{num}.exe"),
                capture_output=True,
                timeout=10,
                check=True)
        except subprocess.TimeoutExpired:
            raise Result(win, f"AI{num}编译超时")
        except subprocess.CalledProcessError as p:
            with open(f"/root/output/ai{num}.compile_log", "wb") as fd:
                fd.write(p.stderr)
                fd.write(b"\n")
                fd.write(p.stdout)
            raise Result(win, f"AI{num}编译失败")
        except Exception:
            raise Result(win, f"AI{num}编译失败")


try:
    main()
    raise RuntimeError("unexpected normal end")
except Result as r:
    with open("/root/output/result.json", "w") as fd:
        json.dump({"win": r.win.name, "message": r.message}, fd, indent=4, ensure_ascii=False)
except Exception as e:
    with open("/root/output/error.txt", "w") as fd:
        fd.write(traceback.format_exc())
