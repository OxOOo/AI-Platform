<template>
  <div>
    <a-pagination
      v-model="condition.page"
      :page-size="page_size"
      :total="total"
      @change="handlePageChange"
    />
    <br>
    <a-table :columns="columns" :data-source="battle_rounds" bordered row-key="_id" :pagination="false">
      <span slot="id" slot-scope="_,row">
        <nuxt-link v-if="row.finished" :to="'/battle_rounds/'+row._id">
          {{ row._id }}
        </nuxt-link>
        <span v-else>{{ row._id }}</span>
      </span>
      <span slot="ai_num" slot-scope="_,row">
        {{ row.ais.length }}
      </span>
      <span slot="datetime" slot-scope="datetime">
        {{ showDateTime(datetime) }}
      </span>
      <span slot="status" slot-scope="_,row">
        {{ row.finished ? "对战完成" : `对战中(${row.finished_battle_cnt}/${row.battles.length})` }}
      </span>
      <span slot="action" slot-scope="_, row">
        <nuxt-link v-if="row.finished" :to="'/battle_rounds/'+row._id">
          <a-button>
            查看
          </a-button>
        </nuxt-link>
      </span>
    </a-table>
    <br>
    <a-pagination
      v-model="condition.page"
      :page-size="page_size"
      :total="total"
      @change="handlePageChange"
    />
  </div>
</template>

<script>
import moment from "moment";

export default {
    layout: "main",

    data () {
        return {
            columns: [
                {
                    title: "编号",
                    width: 100,
                    scopedSlots: { customRender: "id" }
                },
                {
                    title: "AI数量",
                    width: 100,
                    scopedSlots: { customRender: "ai_num" }
                },
                {
                    title: "对战状态",
                    width: 200,
                    scopedSlots: { customRender: "status" }
                },
                {
                    title: "创建时间",
                    width: 200,
                    dataIndex: "created_date",
                    scopedSlots: { customRender: "datetime" }
                },
                {
                    title: "操作",
                    width: 200,
                    scopedSlots: { customRender: "action" }
                }
            ],
            battle_rounds: [],
            condition: {
                page: parseInt(this.$route.query.page || 1) // 当前页码
            },
            total: 0, // 数据总数
            page_size: 20 // 每页数据条数
        };
    },
    head () {
        return {
            title: "两两对战列表"
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
            this.condition.page = parseInt(this.$route.query.page || 1);

            const res = await this.$http.get("/battle_rounds", {
                current: this.condition.page,
                page_size: this.page_size
            });
            this.battle_rounds = res.data;
            this.total = res.total;
            this.page_size = res.page_size;
        },
        handlePageChange () {
            this.$router.push({ path: "/battle_rounds", query: this.condition });
        }
    }
};
</script>
