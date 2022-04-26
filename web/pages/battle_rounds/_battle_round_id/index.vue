<template>
  <div>
    <a-descriptions :title="'两两对战 - ' + battle_round._id" bordered :column="2">
      <a-descriptions-item label="对局数量">
        {{ (battle_round.battles || []).length }}
      </a-descriptions-item>
      <a-descriptions-item label="发起时间">
        {{ showDateTime(battle_round.created_date) }}
      </a-descriptions-item>
    </a-descriptions>
    <br>
    <a-table :columns="ai_columns" :data-source="sortedAIs" bordered row-key="_id" :pagination="false">
      <span slot="AI" slot-scope="_,row">
        {{ row.user.nickname }} (版本 {{ row._id }})
      </span>
    </a-table>
    <br>
    <BattleList :battles="battle_round.battles || []" />
  </div>
</template>

<script>
import moment from "moment";
import _ from "lodash";

export default {
    layout: "main",

    data () {
        return {
            battle_round_id: this.$route.params.battle_round_id,
            battle_round: {},
            ai_columns: [
                {
                    title: "排名",
                    dataIndex: "rank",
                    width: 100
                },
                {
                    title: "得分",
                    dataIndex: "score",
                    width: 100
                },
                {
                    title: "AI",
                    scopedSlots: { customRender: "AI" }
                }
            ]
        };
    },
    head () {
        return {
            title: `两两对战 - ${this.$route.params.battle_round_id}`
        };
    },
    computed: {
        sortedAIs () {
            if (!this.battle_round.ais) { return []; }
            let ais = _.cloneDeep(this.battle_round.ais);
            for (const ai of ais) {
                ai.score = this.battle_round.scores[ai._id];
            }
            ais = _.sortBy(ais, "score");
            ais = ais.reverse();
            for (let i = 0; i < ais.length; i++) {
                if (i === 0) {
                    ais[i].rank = 1;
                } else if (ais[i].score === ais[i - 1].score) {
                    ais[i].rank = ais[i - 1].rank;
                } else {
                    ais[i].rank = i + 1;
                }
            }
            return ais;
        }
    },
    watch: {
        $route () {
            this.update();
        }
    },
    async created () {
        await this.update();
    },
    methods: {
        showDateTime (datetime) {
            return moment(datetime).format("YYYY-MM-DD HH:mm");
        },
        async update () {
            const res = await this.$http.get("/battle_round", {
                battle_round_id: this.battle_round_id
            });
            this.battle_round = res.data;
        }
    }
};
</script>
