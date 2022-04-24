<template>
  <div class="form">
    <a-form :form="form" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }" @submit="handleSubmit">
      <a-form-item label="AI代码">
        <a-input
          v-decorator="['code', { rules: [{ required: true, message: 'AI代码不能为空' }] }]"
          type="textarea"
          :auto-size="{minRows: 10}"
          placeholder="请输入AI代码"
        />
      </a-form-item>
      <a-form-item :wrapper-col="{ span: 12, offset: 5 }">
        <a-button type="primary" html-type="submit" :loading="submitting">
          提交
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
export default {
    layout: "main",

    data () {
        return {
            formLayout: "horizontal",
            form: this.$form.createForm(this, { name: "code_submit" }),

            submitting: false
        };
    },
    methods: {
        handleSubmit (e) {
            e.preventDefault();
            this.form.validateFields(async (err, values) => {
                if (!err) {
                    try {
                        this.submitting = true;
                        await this.$http.post("ai/submit", {}, values);
                        this.$message.success("提交成功");
                        this.$router.push("/myais");
                    } finally {
                        this.submitting = false;
                    }
                }
            });
        }
    }
};
</script>

<style scoped>
.form {
    max-width: 1000px;
    margin-top: 10px;
    margin-left: auto;
    margin-right: auto;
}
</style>
