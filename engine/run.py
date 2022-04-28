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
import shlex
from enum import Enum
import json
import traceback
import numpy as np
import signal
from functools import wraps
import errno
import os
import select
import time

# 全局变量
ais = {}


class Win(Enum):
    TIE = 0
    AI1_WIN = 1
    AI2_WIN = 2


class Result(Exception):
    def __init__(self, win: Win, message: str) -> None:
        super().__init__()
        self.win = win
        self.message = message


class Chessboard:
    def __init__(self) -> None:
        self.map = np.zeros((11, 11), dtype=np.int32)
        self.current_player = 1

    def check_win(self):
        dx = [0, 1, 1, 1]
        dy = [1, 0, -1, 1]
        for player in [1, 2]:
            for x in range(self.map.shape[0]):
                for y in range(self.map.shape[1]):
                    for d in range(4):
                        cnt = 0
                        for i in range(5):
                            nx = x + dx[d] * i
                            ny = y + dy[d] * i
                            passed = False
                            if 0 <= nx < self.map.shape[0] and 0 <= ny < self.map.shape[1]:
                                if self.map[nx][ny] == player:
                                    passed = True
                            if passed:
                                cnt += 1
                            else:
                                break
                        if cnt >= 5:
                            raise Result(Win.AI1_WIN if player == 1 else Win.AI2_WIN, f"AI{player}获胜")

    def move(self, x: int, y: int):
        """
        当前玩家下一个棋子
        """
        valid = True
        if x < 0:
            valid = False
        if x >= self.map.shape[0]:
            valid = False
        if y < 0:
            valid = False
        if y >= self.map.shape[1]:
            valid = False
        if not valid:
            raise Result(Win.AI2_WIN if self.current_player == 1 else Win.AI1_WIN, f"落子({x}, {y})非法")
        if self.map[x][y] != 0:
            raise Result(Win.AI2_WIN if self.current_player == 1 else Win.AI1_WIN, f"落子({x}, {y})已经有棋子")

        self.map[x][y] = self.current_player
        self.current_player = 1 + 2 - self.current_player

    def str_status(self):
        """
        当前局面的字符串表示
        """
        lines = []
        lines.append(f"{self.current_player}")
        for i in range(self.map.shape[0]):
            lines.append(" ".join([str(v) for v in self.map[i]]))
        return "\n".join(lines)

    def is_full(self):
        return np.all(self.map.reshape(-1) != 0)


def timeout(seconds=100, error_message=os.strerror(errno.ETIME)):
    def decorator(func):
        def _handle_timeout(signum, frame):
            raise RuntimeError(f"Timeout: {error_message}")

        @wraps(func)
        def wrapper(*args, **kwargs):
            signal.signal(signal.SIGALRM, _handle_timeout)
            signal.alarm(seconds)
            try:
                result = func(*args, **kwargs)
            finally:
                signal.alarm(0)
            return result
        return wrapper
    return decorator


def wait_readable(io, timeout: int, timeout_result: Result):
    poll_obj = select.poll()
    poll_obj.register(io, select.POLLIN)
    begin_time = time.time()
    while time.time() - begin_time < timeout:
        poll_result = poll_obj.poll(0.1)
        if poll_result:
            return
    raise timeout_result


def set_ai_user(player: int):
    def set_ids():
        os.setgid(1000 + player)
        os.setuid(1000 + player)

    return set_ids


@timeout(60 * 10)
def main():
    # 编译
    for num, win in [(1, Win.AI2_WIN), (2, Win.AI1_WIN)]:
        try:
            subprocess.run(
                shlex.split(f"g++ --std=c++14 -O2 /root/code/ai{num}.cpp -o /root/code/ai{num}.exe"),
                capture_output=True,
                timeout=30,
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

    # 设置权限
    assert os.system("chmod a+x /root") == 0
    assert os.system("chmod a+x /root/code") == 0
    assert os.system("chmod a+x /root/code/ai1.exe") == 0
    assert os.system("chmod a+x /root/code/ai2.exe") == 0

    # 初始化
    for player in [1, 2]:
        ais[player] = subprocess.Popen([f"/root/code/ai{player}.exe"], stdin=subprocess.PIPE, stdout=subprocess.PIPE, preexec_fn=set_ai_user(player))
    for player in [1, 2]:
        wait_readable(ais[player].stdout, 30, Result(Win.AI2_WIN if player == 1 else Win.AI1_WIN, f"AI{player}初始化超时"))
        line = ais[player].stdout.readline()
        line = line.decode().strip()
        if line != "init end":
            raise Result(Win.AI2_WIN if player == 1 else Win.AI1_WIN, f"AI{player}初始化失败，输出为`{line}`")

    board = Chessboard()
    moves = []
    while not board.is_full():
        status = board.str_status()
        player = board.current_player

        if ais[player].poll() is not None:
            raise Result(Win.AI2_WIN if player == 1 else Win.AI1_WIN, f"AI{player}异常退出")
        try:
            ais[player].stdin.write((status + "\n").encode())
            ais[player].stdin.flush()
        except BrokenPipeError:
            raise Result(Win.AI2_WIN if player == 1 else Win.AI1_WIN, f"AI{player}异常退出")
        wait_readable(ais[player].stdout, 5, Result(Win.AI2_WIN if player == 1 else Win.AI1_WIN, f"AI{player}计算超时"))
        line = ais[player].stdout.readline()
        line = line.decode().strip()
        try:
            x, y = line.split()
            x = int(x)
            y = int(y)
        except:
            raise Result(Win.AI2_WIN if player == 1 else Win.AI1_WIN, f"AI{player}输出格式错误，输出内容为`{line}`")
        board.move(x, y)
        moves.append({"x": x, "y": y, "player": player})
        with open("/root/output/moves.json", "w") as fd:
            json.dump(moves, fd, indent=4)
        board.check_win()
    raise Result(Win.TIE, "平局")


try:
    main()
    raise RuntimeError("unexpected normal end")
except Result as r:
    with open("/root/output/result.json", "w") as fd:
        json.dump({"win": r.win.name, "message": r.message}, fd, indent=4, ensure_ascii=False)
except Exception as e:
    with open("/root/output/error.txt", "w") as fd:
        fd.write(traceback.format_exc())
finally:
    for p in ais.values():
        p.terminate()
        p.kill()
        p.wait(10)
