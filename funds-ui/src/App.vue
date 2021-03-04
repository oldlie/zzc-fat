<template>
  <a-layout>
    <a-layout-header class="header">
      <div class="logo" />
      <a-menu
        theme="dark"
        mode="horizontal"
        v-model:selectedKeys="selectedKeys1"
        :style="{ lineHeight: '64px' }"
      >
        <a-menu-item key="1">
          <router-link to="/"> <HomeOutlined />概况 </router-link>
        </a-menu-item>
        <a-menu-item key="2"><StockOutlined />分析</a-menu-item>
      </a-menu>
    </a-layout-header>
    <a-layout-content :style="{ background: '#fff', padding: '48px', margin: 0, minHeight: '600px' }">
      <router-view></router-view>
    </a-layout-content>
    <a-layout-footer style="text-align: center">
      ZZC Funds Analysis Tool ©2021 Created by OLDLIE
    </a-layout-footer>
  </a-layout>
</template>
<script lang="ts">
import {
  UserOutlined,
  LaptopOutlined,
  HomeOutlined,
  NotificationOutlined,
  StockOutlined,
} from "@ant-design/icons-vue";
import { defineComponent, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

export default defineComponent({
  components: {
    UserOutlined,
    LaptopOutlined,
    HomeOutlined,
    NotificationOutlined,
    StockOutlined,
  },
  setup() {
    const router = useRouter();
    router.push('/');
    return {
      selectedKeys1: ref<string[]>(["1"]),
      selectedKeys2: ref<string[]>(["1"]),
      openKeys: ref<string[]>(["sub1"]),
    };
  },
});
</script>
<style>
#components-layout-demo-top-side .logo {
  float: left;
  width: 120px;
  height: 31px;
  margin: 16px 24px 16px 0;
  background: rgba(255, 255, 255, 0.3);
}

.ant-row-rtl #components-layout-demo-top-side .logo {
  float: right;
  margin: 16px 0 16px 24px;
}

.site-layout-background {
  background: #fff;
}
</style>
