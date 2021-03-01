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
  columns: buildColumns(),
});

// ====== Date calculate ====================
function formatDate(d) {
  let year = d.getFullYear();
  let month = d.getMonth() + 1;
  let date = d.getDate();
  return year * 10000 + month * 100 + date;
}

function buildDateList() {
  let dates = [];
  let now = new Date();
  dates.push(formatDate(now));
  now.setDate(now.getDate() - 1);
  dates.push(formatDate(now));
  now.setDate(now.getDate() - 1);
  dates.push(formatDate(now));
  now.setDate(now.getDate() - 1);
  dates.push(formatDate(now));
  now.setDate(now.getDate() - 1);
  dates.push(formatDate(now));
  return dates;
}
// ======= .Date calculate ==================

function buildColumns() {
  let columns = [];
  columns.push({ title: "代码", dataIndex: "code", key: "code" });
  columns.push({ title: "基金", dataIndex: "alias", key: "title" });
  columns.push({ title: "操作", dataIndex: "action", key: "action" });
  let dates = buildDateList();
  for (let index in dates) {
    let item = dates[index];
    columns.push({ title: item, dataIndex: item, key: item });
  }
  return columns;
}

// ======= load inforamtion =================
infoState.infoLoading = true;
ipcRenderer.send("async-info");
ipcRenderer.on("async-info-reply", (event, info, daliy) => {
  console.log("info===>", info, daliy);

  let data = [];
  for (let key in info) {
    let bi = info[key];
    let code = bi["code"];
    let _item = {
      code,
      alias: bi["alias"],
    };
    for (let k2 in daliy) {
      let changes = daliy[k2];
      if (!changes || changes.length <= 0) {
        continue;
      }
      let daliyChange = changes.filter((x) => x["funds_code"] === code);
      if (!daliyChange || daliyChange.length <= 0) {
        continue;
      }
      let dates = buildDateList();
      for (let k3 in dates) {
        let _ymd = dates[k3];
        let found = false;
        for (let k4 in daliyChange) {
          let _daliy = daliyChange[k4];
          let ymd =
            Number(_daliy["y"]) * 10000 + Number(_daliy["m"]) * 100 + Number(_daliy["d"]);
          if (_ymd === ymd) {
            _item[ymd] = _daliy["funds_change"];
            found = true;
            break;
          }
        }
        if (!found) {
          _item[ymd] = 0;
        }
      }
    }

    data.push(_item);
  }
  console.log(data);
  infoState.dataSource = data;
  infoState.infoLoading = false;
});
// ======= ./ load inforamtion =================
</script>
