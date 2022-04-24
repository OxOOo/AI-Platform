<template>
  <div>
    <div v-if="$store.getters.myInfo">
      <h2>欢迎{{ $store.getters.myInfo.nickname }}来到五子棋AI对战平台。</h2>
      <div>
        快捷入口:
        <a-divider type="vertical" />
        <nuxt-link to="/submit">
          提交AI
        </nuxt-link>
        <a-divider type="vertical" />
        <nuxt-link to="/myais">
          我的AI
        </nuxt-link>
        <a-divider type="vertical" />
      </div>
      <a-divider />
      <div>
        参赛手册：<a href="#">下载</a>
      </div>
    </div>
    <div v-else>
      <h2>
        欢迎来到五子棋AI对战平台。请先<nuxt-link to="/login">
          登录
        </nuxt-link>
      </h2>
    </div>
  </div>
</template>

<script>
export default {
    layout: "main",

    data () {
        return {
        };
    }
};
</script>
