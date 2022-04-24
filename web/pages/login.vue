<template>
  <div class="form">
    <a-form
      :form="form"
      class="login-form"
      @submit="handleSubmit"
    >
      <a-form-item label="Username">
        <a-input
          v-decorator="[
            'username',
            { rules: [{ required: true, message: 'Please input your username!' }] },
          ]"
          placeholder="Username"
        >
          <a-icon slot="prefix" type="user" style="color: rgba(0,0,0,.25)" />
        </a-input>
      </a-form-item>
      <a-form-item label="Password">
        <a-input
          v-decorator="[
            'password',
            { rules: [{ required: true, message: 'Please input your Password!' }] },
          ]"
          type="password"
          placeholder="Password"
        >
          <a-icon slot="prefix" type="lock" style="color: rgba(0,0,0,.25)" />
        </a-input>
      </a-form-item>
      <a-form-item>
        <a class="login-form-forgot" href="#" @click="handleForgot">
          忘记密码
        </a>
        <a-button type="primary" html-type="submit" class="login-form-button">
          登录
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
import Cookie from "js-cookie";

export default {
    layout: "main",
    head () {
        return {
            title: "登录"
        };
    },

    beforeCreate () {
        this.form = this.$form.createForm(this, { name: "normal_login" });
    },
    methods: {
        handleSubmit (e) {
            e.preventDefault();
            this.form.validateFields(async (err, values) => {
                if (err) {
                    return;
                }
                const res = await this.$http.post("/user/login", {}, values);
                Cookie.set("UserAuth", res.user_auth);
                this.$message.success("登录成功");
                location.href = "/";
            });
        },
        handleForgot (e) {
            e.preventDefault();
            this.$message.info("请与管理员联系");
        }
    }
};
</script>
<style scoped>
.form {
  display: flex;
  align-items: center;
  justify-content: center;
}
.login-form {
  max-width: 300px;
}
.login-form-forgot {
  float: right;
}
.login-form-button {
  width: 100%;
}
</style>
