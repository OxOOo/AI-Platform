#include <iostream>
#include <stack>
#include <cstring>
#include <ctime>
#include <cmath>
#include <cassert>

using namespace std;

const int MAXN = 11;
const int dx[] = {0, 1, 1, 1};
const int dy[] = {1, 0, 1, -1};

const double C = 1;

class State
{
    int8_t piece_cnt;
    int8_t win; // 谁获胜，0表示平局或者还没结束

public:
    int8_t host_player;
    int8_t current_player;
    int8_t chessboard[MAXN][MAXN];

    void input()
    {
        {
            int x;
            cin >> x;
            host_player = current_player = x;
        }
        piece_cnt = 0;
        for (int i = 0; i < MAXN; i++)
        {
            for (int j = 0; j < MAXN; j++)
            {
                int x;
                cin >> x;
                chessboard[i][j] = x;
                piece_cnt += int(x != 0);
            }
        }
        win = 0;
    }

    inline bool isok(int x, int y) const
    {
        return 0 <= x && x < MAXN && 0 <= y && y < MAXN;
    }
    // 移动一步
    void move(int x, int y)
    {
        assert(chessboard[x][y] == 0);
        assert(win == 0);

        int8_t player = current_player;
        current_player = 3 - current_player;
        piece_cnt++;

        chessboard[x][y] = player;

        for (int d = 0; d < 4; d++)
        {
            int plen = 1;
            while (true)
            {
                int nx = x + dx[d] * plen;
                int ny = y + dy[d] * plen;
                if (!isok(nx, ny))
                    break;
                if (chessboard[nx][ny] != player)
                    break;
                plen++;
            }

            int nlen = 1;
            while (true)
            {
                int nx = x - dx[d] * nlen;
                int ny = y - dy[d] * nlen;
                if (!isok(nx, ny))
                    break;
                if (chessboard[nx][ny] != player)
                    break;
                nlen++;
            }

            if (plen + nlen - 1 >= 5)
            {
                win = player;
            }
        }
    }
    // 在(x, y)落子之后是否能胜利
    int check_win(int x, int y) const
    {
        assert(chessboard[x][y] == 0);
        if (win != 0)
            return win;

        for (int d = 0; d < 4; d++)
        {
            int plen = 1;
            while (true)
            {
                int nx = x + dx[d] * plen;
                int ny = y + dy[d] * plen;
                if (!isok(nx, ny))
                    break;
                if (chessboard[nx][ny] != current_player)
                    break;
                plen++;
            }

            int nlen = 1;
            while (true)
            {
                int nx = x - dx[d] * nlen;
                int ny = y - dy[d] * nlen;
                if (!isok(nx, ny))
                    break;
                if (chessboard[nx][ny] != current_player)
                    break;
                nlen++;
            }

            if (plen + nlen - 1 >= 5)
            {
                return current_player;
            }
        }

        return 0;
    }
    inline bool is_final() const
    {
        return (win != 0) || (piece_cnt == MAXN * MAXN);
    }
    inline int who_win() const
    {
        return win;
    }
};

struct Node
{
    int win_cnt, total_cnt;

    int unexpanded_moves_n;
    pair<int8_t, int8_t> unexpanded_moves[MAXN * MAXN];
    Node *children[MAXN][MAXN];

    int best_move_x;
    int best_move_y;
};
stack<Node *> mem;

Node *newNode(const State &state)
{
    assert(!mem.empty());

    Node *p = mem.top();
    mem.pop();

    p->win_cnt = 0;
    p->total_cnt = 0;
    p->unexpanded_moves_n = 0;
    p->best_move_x = -1;
    p->best_move_y = -1;
    for (int x = 0; x < MAXN; x++)
    {
        for (int y = 0; y < MAXN; y++)
        {
            if (state.chessboard[x][y] == 0)
            {
                if (p->best_move_x < 0 && state.check_win(x, y) == state.current_player)
                {
                    p->best_move_x = x;
                    p->best_move_y = y;
                }
                else
                {
                    p->unexpanded_moves[p->unexpanded_moves_n] = {x, y};
                    p->unexpanded_moves_n++;
                }
            }
        }
    }
    memset(p->children, 0, sizeof(p->children));

    return p;
}

int simulate(State *state)
{
    pair<int8_t, int8_t> possible_moves[MAXN * MAXN];

    while (!state->is_final())
    {
        int move_x = -1, move_y = -1;
        for (int tries = 0; tries < MAXN; tries++)
        {
            int x = rand() % MAXN;
            int y = rand() % MAXN;
            if (state->chessboard[x][y] == 0)
            {
                move_x = x;
                move_y = y;
                break;
            }
        }
        if (move_x < 0)
        {
            int n = 0;
            for (int x = 0; x < MAXN; x++)
            {
                for (int y = 0; y < MAXN; y++)
                {
                    if (state->chessboard[x][y] == 0)
                    {
                        possible_moves[n++] = {x, y};
                    }
                }
            }
            assert(n > 0);
            int i = rand() % n;
            move_x = possible_moves[i].first;
            move_y = possible_moves[i].second;
        }
        assert(move_x >= 0);

        state->move(move_x, move_y);
    }
    return state->who_win() == state->host_player;
}
// 蒙特卡洛树搜索，返回这次模拟是否胜利了
int mcts(Node *cur, State *state)
{
    if (state->is_final())
    {
        cur->total_cnt++;
        cur->win_cnt += int(state->who_win() == state->host_player);
        return int(state->who_win() == state->host_player);
    }
    if (cur->best_move_x >= 0)
    {
        int x = cur->best_move_x;
        int y = cur->best_move_y;
        state->move(x, y);

        if (cur->children[x][y] == NULL)
        {
            cur->children[x][y] = newNode(*state);
        }
        int sresult = mcts(cur->children[x][y], state);
        cur->total_cnt++;
        cur->win_cnt += sresult;
        return sresult;
    }

    if (cur->unexpanded_moves_n > 0)
    {
        int i = rand() % cur->unexpanded_moves_n;
        swap(cur->unexpanded_moves[i], cur->unexpanded_moves[cur->unexpanded_moves_n - 1]);
        int x = cur->unexpanded_moves[cur->unexpanded_moves_n - 1].first;
        int y = cur->unexpanded_moves[cur->unexpanded_moves_n - 1].second;
        cur->unexpanded_moves_n--;

        state->move(x, y);
        assert(cur->children[x][y] == NULL);
        cur->children[x][y] = newNode(*state);

        int sresult = simulate(state);

        cur->children[x][y]->total_cnt++;
        cur->children[x][y]->win_cnt += sresult;
        cur->total_cnt++;
        cur->win_cnt += sresult;

        return sresult;
    }

    typedef pair<int8_t, int8_t> Point;
    typedef pair<double, Point> UCTPoint;
    UCTPoint best_p(-1e100, Point(-1, -1));
    for (int x = 0; x < MAXN; x++)
    {
        for (int y = 0; y < MAXN; y++)
        {
            if (state->chessboard[x][y] != 0)
                continue;
            assert(cur->children[x][y] != NULL);

            double uct = C * sqrt(log(cur->total_cnt) / cur->children[x][y]->total_cnt);
            if (state->current_player == state->host_player)
            {
                uct += double(cur->children[x][y]->win_cnt) / cur->children[x][y]->total_cnt;
            }
            else
            {
                uct -= double(cur->children[x][y]->win_cnt) / cur->children[x][y]->total_cnt;
            }
            best_p = max(best_p, {uct, {x, y}});
        }
    }
    assert(best_p.second.first >= 0);

    state->move(best_p.second.first, best_p.second.second);
    int sresult = mcts(cur->children[best_p.second.first][best_p.second.second], state);
    cur->total_cnt++;
    cur->win_cnt += sresult;
    return sresult;
}

void dfs_free(Node *cur)
{
    for (int x = 0; x < MAXN; x++)
    {
        for (int y = 0; y < MAXN; y++)
        {
            if (cur->children[x][y] != NULL)
            {
                dfs_free(cur->children[x][y]);
            }
        }
    }
    mem.push(cur);
}

int main()
{
    for (int i = 0; i < (1024 * 1024 * 400) / sizeof(Node); i++)
    {
        mem.push(new Node);
    }
    cout << "init end" << endl;

    State board;
    while (true)
    {
        board.input();

        Node *root = newNode(board);

        clock_t stime = clock();
        for (int sims = 0; !mem.empty() && sims < 10000000; sims++)
        {
            if (clock() - stime > 4 * CLOCKS_PER_SEC)
                break;
            State state = board;
            mcts(root, &state);
        }

        typedef pair<int, int> Point;
        typedef pair<double, Point> WinRatePoint;
        WinRatePoint best_point(-1e100, Point(-1, -1));
        for (int x = 0; x < MAXN; x++)
        {
            for (int y = 0; y < MAXN; y++)
            {
                if (root->children[x][y] == NULL)
                    continue;
                best_point = max(best_point, {double(root->children[x][y]->win_cnt) / root->children[x][y]->total_cnt, {x, y}});
            }
        }
        assert(best_point.first >= 0);

        dfs_free(root);
        cout << best_point.second.first << " " << best_point.second.second << endl;
        // cout << "time = " << double(clock() - stime) / CLOCKS_PER_SEC << endl;
    }

    return 0;
}
