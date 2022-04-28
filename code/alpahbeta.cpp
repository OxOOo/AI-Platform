#include <iostream>
#include <cstdlib>
#include <cstdio>
#include <cassert>
#include <cstring>
#include <vector>
#include <ctime>
#include <algorithm>

using namespace std;

const int INF = 0x7FFFFFFF / 2;
const int MAXN = 11;

int host_player;
int piece_cnt;
int8_t chessboard[MAXN][MAXN];

inline bool isok(int x, int y)
{
    return 0 <= x && x < MAXN && 0 <= y && y < MAXN;
}

const int LENGTH_SCORES[3][6] = {
    {0, 0, 1, 15, 50, 10000},     // 0活
    {0, 0, 5, 50, 100, 10000},    // 1活
    {0, 0, 10, 100, 1000, 10000}, // 2活
};
// 计算当前局面的得分，我方希望尽量高，对方希望尽量低
int calc_score()
{
    const static int dx[] = {0, 1, 1, 1};
    const static int dy[] = {1, 0, 1, -1};

    int score = 0;
    for (int x = 0; x < MAXN; x++)
    {
        for (int y = 0; y < MAXN; y++)
        {
            if (chessboard[x][y] == 0)
                continue;

            int cell_max_score = 0;
            for (int d = 0; d < 4; d++)
            {
                int huo = 0;

                int plen = 1;
                while (true)
                {
                    int nx = x + dx[d] * plen;
                    int ny = y + dy[d] * plen;
                    if (!isok(nx, ny))
                        break;
                    if (chessboard[nx][ny] != chessboard[x][y])
                        break;
                    plen++;
                }
                {
                    int nx = x + dx[d] * plen;
                    int ny = y + dy[d] * plen;
                    if (isok(nx, ny) && chessboard[nx][ny] == 0)
                        huo++;
                }

                int nlen = 1;
                while (true)
                {
                    int nx = x - dx[d] * nlen;
                    int ny = y - dy[d] * nlen;
                    if (!isok(nx, ny))
                        break;
                    if (chessboard[nx][ny] != chessboard[x][y])
                        break;
                    nlen++;
                }
                {
                    int nx = x - dx[d] * nlen;
                    int ny = y - dy[d] * nlen;
                    if (isok(nx, ny) && chessboard[nx][ny] == 0)
                        huo++;
                }

                int len = min(5, plen + nlen - 1);
                if (len == 5)
                {
                    if (host_player == chessboard[x][y])
                    {
                        return LENGTH_SCORES[0][5] - piece_cnt;
                    }
                    else
                    {
                        return -(LENGTH_SCORES[0][5] - piece_cnt);
                    }
                }

                cell_max_score = max(cell_max_score, LENGTH_SCORES[huo][len]);
            }

            if (chessboard[x][y] == host_player)
            {
                score += cell_max_score;
            }
            else
            {
                score -= cell_max_score;
            }
        }
    }
    return score;
}

// 从(x, y)出发是否已经获胜了
int is_win(int x, int y)
{
    const static int dx[] = {0, 1, 1, 1};
    const static int dy[] = {1, 0, 1, -1};
    assert(chessboard[x][y] != 0);

    for (int d = 0; d < 4; d++)
    {
        int plen = 0;
        while (true)
        {
            int nx = x + dx[d] * (plen + 1);
            int ny = y + dy[d] * (plen + 1);
            if (!isok(nx, ny))
                break;
            if (chessboard[nx][ny] != chessboard[x][y])
                break;
            plen++;
        }

        int nlen = 0;
        while (true)
        {
            int nx = x - dx[d] * (nlen + 1);
            int ny = y - dy[d] * (nlen + 1);
            if (!isok(nx, ny))
                break;
            if (chessboard[nx][ny] != chessboard[x][y])
                break;
            nlen++;
        }

        if (plen + nlen + 1 >= 5)
            return chessboard[x][y];
    }

    return 0;
}

int alphabeta(int deepremain, int last_x, int last_y, int player, int alpha, int beta)
{
    if (is_win(last_x, last_y))
    {
        return calc_score();
    }

    if (deepremain == 0)
    {
        return calc_score();
    }

    int is_final = 1;
    for (int x = 0; x < MAXN; x++)
    {
        for (int y = 0; y < MAXN; y++)
        {
            if (chessboard[x][y] != 0)
                continue;
            is_final = 0;

            chessboard[x][y] = player;
            piece_cnt++;
            int v = alphabeta(deepremain - 1, x, y, 3 - player, alpha, beta);
            chessboard[x][y] = 0;
            piece_cnt--;

            if (player == host_player)
            {
                alpha = max(alpha, v);
            }
            else
            {
                beta = min(beta, v);
            }

            if (alpha >= beta)
                break;
        }
    }

    if (is_final)
        return calc_score();
    return (player == host_player) ? alpha : beta;
}

int main()
{
    typedef pair<int, int> Point;
    typedef pair<int, Point> PointDist;
    vector<PointDist> point_dists;
    for (int x = 0; x < MAXN; x++)
    {
        for (int y = 0; y < MAXN; y++)
        {
            point_dists.push_back(PointDist(abs(x - 5) + abs(y - 5), Point(x, y)));
        }
    }
    sort(point_dists.begin(), point_dists.end());

    cout << "init end" << endl;

    while (cin >> host_player)
    {
        piece_cnt = 0;
        memset(chessboard, 0, sizeof(chessboard));

        for (int i = 0; i < MAXN; i++)
        {
            for (int j = 0; j < MAXN; j++)
            {
                int x;
                cin >> x;
                chessboard[i][j] = x;
            }
        }

        for (int x = 0; x < MAXN; x++)
        {
            for (int y = 0; y < MAXN; y++)
            {
                if (chessboard[x][y] != 0)
                {
                    piece_cnt++;
                }
            }
        }

        if (piece_cnt == 0)
        {
            cout << 5 << " " << 5 << endl;
            continue;
        }

        int alpha = -INF;
        int beta = INF;
        int best_x = -1;
        int best_y = -1;

        clock_t stime = clock();
        for (const auto &p : point_dists)
        {
            if (clock() - stime > CLOCKS_PER_SEC * 4.5)
                break;

            int x = p.second.first;
            int y = p.second.second;

            if (chessboard[x][y] != 0)
                continue;

            chessboard[x][y] = host_player;
            piece_cnt++;
            int v = alphabeta(3, x, y, 3 - host_player, alpha, beta);
            chessboard[x][y] = 0;
            piece_cnt--;

            if (v > alpha)
            {
                alpha = v;
                best_x = x;
                best_y = y;
            }
        }

        cout << best_x << " " << best_y << endl;
    }

    return 0;
}
