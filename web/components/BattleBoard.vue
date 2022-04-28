<template>
  <div>
    <a-descriptions bordered :column="2">
      <a-descriptions-item label="AI1(黑方，先手)：">
        {{ (ai1.user || {}).nickname }} (版本 {{ ai1._id }})
      </a-descriptions-item>
      <a-descriptions-item label="AI2(白方，后手)：">
        {{ (ai2.user || {}).nickname }} (版本 {{ ai2._id }})
      </a-descriptions-item>
      <a-descriptions-item label="对局胜负">
        {{ battleResult }}
      </a-descriptions-item>
      <a-descriptions-item label="对局结果">
        {{ battleMessage }}
      </a-descriptions-item>
      <a-descriptions-item label="对局时间" :span="2">
        {{ showDateTime(createdDate) }}
      </a-descriptions-item>
    </a-descriptions>
    <a-divider />
    <div class="chessboard">
      <div ref="board" class="board" />
      <div class="moves">
        <transition-group name="list" tag="p">
          <span v-for="m in showMoves" :key="m" class="move-item list-item">{{ m }}</span>
        </transition-group>
      </div>
    </div>
    <br>
    <div style="display: flex; justify-content: center; align-items: center;">
      <a-button-group>
        <a-button type="primary" :disabled="(moves || []).length == 0" @click="moveBegin">
          清空棋盘
        </a-button>
        <a-button type="primary" :disabled="(moves || []).length == 0" @click="moveEnd">
          移动到最后
        </a-button>
      </a-button-group>
      <button ref="copy" type="primary" style="margin-left: 10px" :data-clipboard-text="boardStatus">
        复制当前局面到剪贴板
      </button>
      <a-button-group style="margin-left: 10px">
        <a-button type="primary" :disabled="moves_cnt == 0" @click="movePrev">
          <a-icon type="left" />上一步
        </a-button>
        <a-button type="primary" :disabled="moves_cnt == (moves || []).length" @click="moveNext">
          下一步<a-icon type="right" />
        </a-button>
      </a-button-group>
      <a-checkbox v-model="autoplay" style="margin-left: 10px">
        自动播放
      </a-checkbox>
    </div>
    <a-divider />
    <br>
    <a-card title="错误信息" size="small">
      <pre>{{ errorTxt }}</pre>
    </a-card>
    <br>
    <a-card title="AI1编译信息" size="small">
      <pre>{{ ai1CompileLog }}</pre>
    </a-card>
    <br>
    <a-card title="AI2编译信息" size="small">
      <pre>{{ ai2CompileLog }}</pre>
    </a-card>
  </div>
</template>

<script>
import moment from "moment";
import Clipboard from "clipboard";
import _ from "lodash";

const CHESSBOARD_OFFSET = 60;
const CHESSBOARD_CELL_SIZE = 40;
const CHESSBOARD_PIECE_SIZE = 35;

export default {
    props: {
        ai1: {
            type: Object,
            default: () => {}
        },
        ai2: {
            type: Object,
            default: () => {}
        },
        ai1CompileLog: {
            type: String,
            default: () => ""
        },
        ai2CompileLog: {
            type: String,
            default: () => ""
        },
        moves: {
            type: Array,
            default: () => []
        },
        errorTxt: {
            type: String,
            default: () => ""
        },
        battleResult: {
            type: String,
            default: () => "TIE"
        },
        battleMessage: {
            type: String,
            default: () => ""
        },

        createdDate: {
            type: String,
            default: () => ""
        }
    },
    data () {
        return {
            app: null,
            moves_cnt: 0,
            autoplay: false,
            timerhandle: null
        };
    },
    computed: {
        showMoves () {
            const show_moves = [];
            let round = 0;
            for (let i = 0; i < this.moves_cnt && i < (this.moves || []).length; i++) {
                const move = this.moves[i];
                if (move.player === 1) {
                    round++;
                }
                show_moves.push(`回合${round}:${[null, "黑方", "白方"][move.player]}落子(${move.x}, ${move.y})`);
            }
            show_moves.reverse();
            return show_moves;
        },
        boardStatus () {
            let player = 1;
            const chessboard = _.range(11).map(i => _.range(11).map(i => 0));

            for (let i = 0; i < this.moves_cnt && i < (this.moves || []).length; i++) {
                const move = this.moves[i];
                chessboard[move.x][move.y] = move.player;
                player = 3 - move.player;
            }

            const board = chessboard.map(row => row.map(x => `${x}`).join(" ")).join("\n");
            return `${player}\n${board}`;
        }
    },
    watch: {
        moves () {
            this.drawStatus();
        }
    },
    async mounted () {
        const PIXI = await import("pixi.js");
        const app = this.app = new PIXI.Application({ height: 500, width: 500, backgroundColor: 0xFFFFFF, resolution: 4 });
        this.$refs.board.appendChild(app.view);
        app.renderer.autoDensity = true;
        app.renderer.resize(500, 500);
        await this.drawStatus();

        this.timerhandle = setInterval(() => {
            if (this.autoplay) {
                this.moves_cnt = Math.min(this.moves_cnt + 1, (this.moves || []).length);
                this.drawStatus();
            }
        }, 1000);

        const clip = new Clipboard(this.$refs.copy);
        clip.on("success", () => {
            this.$message.success("拷贝成功");
        });
        clip.on("error", () => {
            this.$message.error("拷贝失败");
        });
    },
    unmounted () {
        clearInterval(this.timerhandle);
        this.timerhandle = null;
    },
    methods: {
        reset () {
            this.moves_cnt = 0;
            this.drawStatus();
        },
        async drawStatus () {
            const PIXI = await import("pixi.js");
            const app = this.app;

            while (app.stage.children.length > 0) {
                app.stage.removeChild(app.stage.children[0]);
            }

            // 画棋盘
            const graphics = new PIXI.Graphics();
            graphics.lineStyle(1, 0x000000, 1);

            for (let i = 0; i < 11; i++) {
                graphics.moveTo(CHESSBOARD_OFFSET, CHESSBOARD_OFFSET + i * CHESSBOARD_CELL_SIZE);
                graphics.lineTo(CHESSBOARD_OFFSET + CHESSBOARD_CELL_SIZE * 10, CHESSBOARD_OFFSET + i * CHESSBOARD_CELL_SIZE);

                graphics.moveTo(CHESSBOARD_OFFSET + i * CHESSBOARD_CELL_SIZE, CHESSBOARD_OFFSET);
                graphics.lineTo(CHESSBOARD_OFFSET + i * CHESSBOARD_CELL_SIZE, CHESSBOARD_OFFSET + CHESSBOARD_CELL_SIZE * 10);
            }
            app.stage.addChild(graphics);

            // 标记行号
            for (let x = 0; x < 11; x++) {
                let pos_x = CHESSBOARD_OFFSET;
                const pos_y = CHESSBOARD_OFFSET + CHESSBOARD_CELL_SIZE * x;
                pos_x -= 35;

                const text = new PIXI.Text(`${x}`);
                text.x = pos_x;
                text.y = pos_y;
                text.pivot.x = text.width / 2;
                text.pivot.y = text.height / 2;

                app.stage.addChild(text);
            }

            // 标记列号
            for (let y = 0; y < 11; y++) {
                const pos_x = CHESSBOARD_OFFSET + CHESSBOARD_CELL_SIZE * y;
                let pos_y = CHESSBOARD_OFFSET;
                pos_y -= 35;

                const text = new PIXI.Text(`${y}`);
                text.x = pos_x;
                text.y = pos_y;
                text.pivot.x = text.width / 2;
                text.pivot.y = text.height / 2;

                app.stage.addChild(text);
            }

            for (let i = 0; i < this.moves_cnt && i < (this.moves || []).length; i++) {
                const pos_x = CHESSBOARD_OFFSET + CHESSBOARD_CELL_SIZE * this.moves[i].y;
                const pos_y = CHESSBOARD_OFFSET + CHESSBOARD_CELL_SIZE * this.moves[i].x;

                const piece = new PIXI.Graphics();
                piece.lineStyle(1, 0xCCCCCC, 1);
                if (this.moves[i].player === 1) {
                    piece.beginFill(0x0, 1);
                } else {
                    piece.beginFill(0xFFFFFF, 1);
                }
                piece.drawCircle(pos_x, pos_y, CHESSBOARD_PIECE_SIZE / 2);
                piece.endFill();

                if (i + 1 === this.moves_cnt) {
                    piece.lineStyle(3, 0x4169E1, 1);
                    piece.moveTo(pos_x - 10, pos_y);
                    piece.lineTo(pos_x + 10, pos_y);
                    piece.moveTo(pos_x, pos_y - 10);
                    piece.lineTo(pos_x, pos_y + 10);
                }

                app.stage.addChild(piece);
            }
        },
        showDateTime (datetime) {
            return moment(datetime).format("YYYY-MM-DD HH:mm");
        },
        moveBegin () {
            this.autoplay = false;
            this.moves_cnt = 0;
            this.drawStatus();
        },
        moveEnd () {
            this.autoplay = false;
            this.moves_cnt = (this.moves || []).length;
            this.drawStatus();
        },
        movePrev () {
            this.autoplay = false;
            this.moves_cnt = Math.max(0, this.moves_cnt - 1);
            this.drawStatus();
        },
        moveNext () {
            this.autoplay = false;
            this.moves_cnt = Math.min(this.moves_cnt + 1, (this.moves || []).length);
            this.drawStatus();
        }
    }
};
</script>
<style scoped>
.chessboard {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
}
.board {
  height: 500px;
  width: 500px;
  /* border: 1px solid grey; */
}
.moves {
  height: 500px;
  width: 200px;
  border: 1px solid grey;
  overflow-y: scroll;
}
.move-item {
  display: block;
  border-bottom: 1px solid gray;
  padding-left: 20px;
  padding-bottom: 5px;
  padding-top: 10px;
}
.list-item {
  transition: all 1s;
  display: inline-block;
  margin-right: 10px;
}
.list-enter, .list-leave-to
/* .list-complete-leave-active for below version 2.1.8 */ {
  opacity: 0;
  transform: translateY(30px);
}
.list-leave-active {
  position: absolute;
}
</style>
