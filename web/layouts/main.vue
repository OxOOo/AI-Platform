<template>
  <a-config-provider :locale="locale">
    <a-layout class="layout">
      <a-layout-header class="header">
        <div class="logo" />
        <a-menu
          theme="dark"
          mode="horizontal"
          :selected-keys="selected_menus"
          :style="{ lineHeight: '64px' }"
        >
          <a-menu-item key="index">
            <nuxt-link to="/">
              首页
            </nuxt-link>
          </a-menu-item>
          <a-menu-item key="submit">
            <nuxt-link to="/submit">
              提交AI
            </nuxt-link>
          </a-menu-item>
          <a-menu-item key="myais">
            <nuxt-link to="/myais">
              我的AI
            </nuxt-link>
          </a-menu-item>
        </a-menu>
      </a-layout-header>
      <a-layout>
        <a-layout-sider width="200" style="background: #fff">
          <a-menu
            mode="inline"
            :style="{ height: '100%', borderRight: 0 }"
          >
            <a-sub-menu v-if="$store.getters.myInfo">
              <span slot="title"><a-icon type="user" />用户: {{ $store.getters.myInfo.nickname }}</span>
              <a-menu-item>
                <a href="#" @click="handleLogout">登出</a>
              </a-menu-item>
            </a-sub-menu>
            <a-menu-item v-else>
              <nuxt-link to="/login">
                <a-icon type="user" />登录
              </nuxt-link>
            </a-menu-item>
          </a-menu>
        </a-layout-sider>
        <a-layout style="padding: 12px 12px 12px">
          <!-- <a-breadcrumb style="margin: 16px 0">
          <a-breadcrumb-item>Home</a-breadcrumb-item>
          <a-breadcrumb-item>List</a-breadcrumb-item>
          <a-breadcrumb-item>App</a-breadcrumb-item>
        </a-breadcrumb> -->
          <a-layout-content
            :style="{ background: '#fff', padding: '24px', margin: 0, minHeight: '280px' }"
          >
            <Nuxt />
          </a-layout-content>
        </a-layout>
      </a-layout>
    </a-layout>
  </a-config-provider>
</template>

<script>
import zhCN from "ant-design-vue/lib/locale-provider/zh_CN";
import _ from "lodash";
import Cookie from "js-cookie";

export default {
    data () {
        return {
            locale: zhCN,
            selected_menus: []
        };
    },
    watch: {
        $route () {
            this.update_menu();
        }
    },
    created () {
        this.update_menu();
    },
    methods: {
        update_menu () {
            const path = this.$route.path;
            if (path === "/") {
                this.selected_menus = ["index"];
            } else if (_.startsWith(path, "/submit")) {
                this.selected_menus = ["submit"];
            } else if (_.startsWith(path, "/myais")) {
                this.selected_menus = ["myais"];
            } else {
                this.selected_menus = [];
            }
        },
        handleLogout () {
            Cookie.set("UserAuth", "");
            this.$message.success("登出成功");
            location.href = "/";
        }
    }
};
</script>

<style scoped>
.layout {
    min-height: 100vh;
}
.logo {
  width: 120px;
  height: 31px;
  background: rgba(255, 255, 255, 0.2);
  margin: 16px 28px 16px 0;
  float: left;
}
</style>
