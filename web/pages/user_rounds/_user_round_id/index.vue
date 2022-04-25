<template>
  <div>
    <a-descriptions :title="'选手发起的对战 - ' + user_round._id" bordered :column="2">
      <a-descriptions-item label="发起人">
        {{ (user_round.user || {}).nickname }}
      </a-descriptions-item>
      <a-descriptions-item label="对局数量">
        {{ (user_round.battles || []).length }}
      </a-descriptions-item>
      <a-descriptions-item label="发起时间">
        {{ showDateTime(user_round.created_date) }}
      </a-descriptions-item>
    </a-descriptions>
    <br>
    <BattleList :battles="user_round.battles || []" />
  </div>
</template>

<script>
import moment from "moment";

export default {
    layout: "main",

    data () {
        return {
            user_round_id: this.$route.params.user_round_id,
            user_round: {}
        };
    },
    head () {
        return {
            title: `选手发起的对战 - ${this.$route.params.user_round_id}`
        };
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
            const res = await this.$http.get("/user_round", {
                user_round_id: this.user_round_id
            });
            this.user_round = res.data;
        }
    }
};
</script>
