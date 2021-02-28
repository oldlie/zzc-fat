<template>
  <a-space direction="vertical" style="width: 100%">
    <a-page-header style="border: 1px solid rgb(235, 237, 240)" title="基本信息" />

    <a-button @click="openInfoForm">
      <template #icon><PlusOutlined /></template>
      添加基金</a-button
    >

    <a-spin :spinning="infoState.infoLoading">
      <a-table :dataSource="infoState.dataSource" :columns="infoState.columns" />
    </a-spin>
  </a-space>
</template>
<script setup>
import { defineComponent } from "vue";
import { PlusOutlined } from "@ant-design/icons-vue";
import { defineProps, reactive, ref, toRaw } from "vue";
import { message } from "ant-design-vue";
import { useRoute, useRouter } from "vue-router";

const { ipcRenderer } = require("electron");
const router = useRouter();

const defaultColumns = [
  { title: "代码", dataIndex: "funds_code", key: "code" },
  { title: "基金", dataIndex: "funds_title", key: "title" },
  { title: "操作", dataIndex: "action", key: "action" },
  { title: "一", dataIndex: "one", key: "one" },
  { title: "二", dataIndex: "two", key: "two" },
  { title: "三", dataIndex: "three", key: "three" },
  { title: "四", dataIndex: "four", key: "four" },
  { title: "五", dataIndex: "five", key: "five" },
];

const openInfoForm = () => {
  router.push("/info/form");
};

const infoState = reactive({
  infoLoading: false,
  dataSource: [],
  columns: defaultColumns,
});

infoState.infoLoading = true;
ipcRenderer.send("async-info");
ipcRenderer.on('async-info-reply', (event, info, daliy) => {
  console.log('info===>', info, daliy);
  infoState.infoLoading = false;
});
</script>
