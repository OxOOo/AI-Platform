#include <iostream>
#include <cstdlib>
#include <cstdio>

using namespace std;

const int MAXN = 11;
int player;
int chessboard[MAXN][MAXN];

int main()
{
    // 如果有什么初始化，可以写在这里
    // 初始化结束输出`init end`
    srand(time(0));
    cout << "init end" << endl;

    while (cin >> player)
    {
        for (int i = 0; i < MAXN; i++)
        {
            for (int j = 0; j < MAXN; j++)
            {
                cin >> chessboard[i][j];
            }
        }

        // 随机选择一个没有棋子的位置输出
        int x, y;
        while (true)
        {
            x = rand() % MAXN;
            y = rand() % MAXN;
            if (chessboard[x][y] == 0)
                break;
        }
        cout << x << " " << y << endl;
    }

    return 0;
}
