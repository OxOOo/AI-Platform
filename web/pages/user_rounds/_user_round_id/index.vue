<template>
  <div />
</template>

<script>
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
        async update () {
            const res = await this.$http.get("/user_round", {
                user_round_id: this.user_round_id
            });
            this.user_round = res.data;
        }
    }
};
</script>
