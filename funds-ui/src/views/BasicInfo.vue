<template>
  <a-space direction="vertical" style="width: 100%">
    <a-page-header style="border: 1px solid rgb(235, 237, 240)" title="基本信息" />

    <a-button @click="openInfoForm">
      <template #icon><PlusOutlined /></template>
      添加基金</a-button
    >

    <a-table :dataSource="dataSource" :columns="columns" />
  </a-space>
</template>
<script>
import { defineComponent } from "vue";
import { PlusOutlined } from "@ant-design/icons-vue";

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
 
export default {
  components: {
    PlusOutlined,
  },
  data() {
    return {
      columns: defaultColumns,
      dataSource: [],
    };
  },
  methods: {
      openInfoForm () {
          this.$router.push('/info/form');
      }
  },
};
</script>
