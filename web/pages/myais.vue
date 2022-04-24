<template>
  <div>
    <p>
      和其他所有人进行一次对战：
      <a-button type="primary" @click="handleCreateUserRound">
        我要打十个！！！
      </a-button>
    </p>
    <a-pagination
      v-model="condition.page"
      :page-size="page_size"
      :total="total"
      @change="handlePageChange"
    />
    <br>
    <a-table :columns="columns" :data-source="ais" bordered row-key="_id" :pagination="false">
      <span slot="bytes" slot-scope="num">
        {{ showBytes(num) }}
      </span>
      <span slot="datetime" slot-scope="datetime">
        {{ showDateTime(datetime) }}
      </span>
      <span slot="action" slot-scope="text, row">
        <a-button @click="handleDownload(row)">
          下载
        </a-button>
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
import bytes from "bytes";
import { saveAs } from "file-saver";

export default {
    layout: "main",

    data () {
        return {
            columns: [
                {
                    title: "编号",
                    dataIndex: "_id",
                    width: 100
                },
                {
                    title: "代码长度",
                    width: 200,
                    dataIndex: "code_length",
                    scopedSlots: { customRender: "showbytes" }
                },
                {
                    title: "提交时间",
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
            ais: [],
            condition: {
                page: parseInt(this.$route.query.page || 1) // 当前页码
            },
            total: 0, // 数据总数
            page_size: 20 // 每页数据条数
        };
    },
    head () {
        return {
            title: "我的AI列表"
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
        showBytes (num) {
            return bytes(num);
        },
        async update () {
            this.condition.page = parseInt(this.$route.query.page || 1);

            const res = await this.$http.get("/ai/myais", {
                current: this.condition.page,
                page_size: this.page_size
            });
            this.ais = res.data;
            this.total = res.total;
            this.page_size = res.page_size;
        },
        handlePageChange () {
            this.$router.push({ path: "/myais", query: this.condition });
        },
        async handleDownload (ai) {
            const res = await this.$http.get("/ai/download", { ai_id: ai._id });
            const blob = new Blob([res.code], { type: "text/plain;charset=utf-8" });
            saveAs(blob, `ai${ai._id}.cpp`);
        },
        async handleCreateUserRound () {
            await this.$http.post("/ai/create_user_round");
            this.$message.success("创建对战成功");
        }
    }
};
</script>
