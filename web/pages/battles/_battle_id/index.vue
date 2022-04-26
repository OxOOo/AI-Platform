<template>
  <div>
    <a-divider>对局 - {{ battle._id }}</a-divider>
    <div>
      查看对局：
      <a-select v-model="show_battle" @change="showBattle">
        <a-select-option value="pos">
          {{ ((battle.ai1 || {}).user || {}).nickname }} (版本 {{ (battle.ai1 || {})._id }})
          vs
          {{ ((battle.ai2 || {}).user || {}).nickname }} (版本 {{ (battle.ai2 || {})._id }})
        </a-select-option>
        <a-select-option value="rev">
          {{ ((battle.ai2 || {}).user || {}).nickname }} (版本 {{ (battle.ai2 || {})._id }})
          vs
          {{ ((battle.ai1 || {}).user || {}).nickname }} (版本 {{ (battle.ai1 || {})._id }})
        </a-select-option>
      </a-select>
    </div>
    <br>
    <BattleBoard
      ref="board"
      :ai1="(show_battle == 'pos' ? battle.ai1 : battle.ai2) || {}"
      :ai2="(show_battle == 'pos' ? battle.ai2 : battle.ai1) || {}"
      :ai1-compile-log="(battle[show_battle] || {}).ai1_compile_log"
      :ai2-compile-log="(battle[show_battle] || {}).ai2_compile_log"
      :moves="(battle[show_battle] || {}).moves"
      :error-txt="(battle[show_battle] || {}).error_txt"
      :battle-result="(battle[show_battle] || {}).battle_result"
      :battle-message="(battle[show_battle] || {}).battle_message"
      :created-date="battle.created_date"
    />
  </div>
</template>

<script>
import moment from "moment";

export default {
    layout: "main",

    data () {
        return {
            battle_id: this.$route.params.battle_id,
            show_battle: "pos",
            battle: {}
        };
    },
    head () {
        return {
            title: `对局 - ${this.$route.params.battle_id}`
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
    mounted () {
        this.showBattle();
    },
    methods: {
        showDateTime (datetime) {
            return moment(datetime).format("YYYY-MM-DD HH:mm");
        },
        showBattle () {
            this.$refs.board.reset();
        },
        async update () {
            const res = await this.$http.get("/battle", {
                battle_id: this.battle_id
            });
            this.battle = res.data;
        }
    }
};
</script>
