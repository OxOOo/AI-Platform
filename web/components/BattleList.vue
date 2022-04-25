<template>
  <div>
    <a-table :columns="columns" :data-source="battles" bordered row-key="_id" :pagination="false">
      <span slot="id" slot-scope="_, row">
        <nuxt-link v-if="row.status == 'finished'" :to="'/battles/' + row._id">
          {{ row._id }}
        </nuxt-link>
        <span v-else>{{ row._id }}</span>
      </span>
      <span slot="ai1user" slot-scope="_,row">
        {{ row.ai1.user.nickname }} (版本 {{ row.ai1._id }})
      </span>
      <span slot="ai2user" slot-scope="_,row">
        {{ row.ai2.user.nickname }} (版本 {{ row.ai2._id }})
      </span>
      <span slot="status" slot-scope="_,row">
        {{ showBattleStatus(row) }}
      </span>
      <span slot="datetime" slot-scope="datetime">
        {{ showDateTime(datetime) }}
      </span>
    </a-table>
  </div>
</template>

<script>
import moment from "moment";

export default {
    props: {
        battles: {
            type: Array,
            default: () => []
        }
    },
    data () {
        return {
            columns: [
                {
                    title: "编号",
                    width: 100,
                    scopedSlots: { customRender: "id" }
                },
                {
                    title: "AI1",
                    width: 100,
                    scopedSlots: { customRender: "ai1user" }
                },
                {
                    title: "AI2",
                    width: 100,
                    scopedSlots: { customRender: "ai2user" }
                },
                {
                    title: "对局状态",
                    width: 200,
                    scopedSlots: { customRender: "status" }
                },
                {
                    title: "创建时间",
                    width: 200,
                    dataIndex: "created_date",
                    scopedSlots: { customRender: "datetime" }
                }
            ]
        };
    },
    methods: {
        showDateTime (datetime) {
            return moment(datetime).format("YYYY-MM-DD HH:mm");
        },
        showBattleStatus (battle) {
            if (battle.status !== "finished") {
                return "对局未结束";
            }
            if (!battle.pos.battle_result || !battle.rev.battle_result) {
                return "出现错误，请联系管理员";
            }
            let ai1_win_cnt = 0;
            let ai2_win_cnt = 0;
            if (battle.pos.battle_result === "AI1_WIN") {
                ai1_win_cnt++;
            }
            if (battle.pos.battle_result === "AI2_WIN") {
                ai2_win_cnt++;
            }
            if (battle.rev.battle_result === "AI1_WIN") {
                ai2_win_cnt++;
            }
            if (battle.rev.battle_result === "AI2_WIN") {
                ai1_win_cnt++;
            }
            if (ai1_win_cnt === 2) {
                return "AI2赢两局";
            }
            if (ai2_win_cnt === 2) {
                return "AI2赢两局";
            }
            if (ai1_win_cnt === 1 && ai2_win_cnt === 1) {
                return "各赢一局";
            }
            if (ai1_win_cnt === 1) {
                return "AI1赢一局平一局";
            }
            if (ai2_win_cnt === 1) {
                return "AI2赢一局平一局";
            }
            return "两局平局";
        }
    }
};
</script>
