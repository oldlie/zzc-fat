<template>
  <a-space direction="vertical" style="width: 100%">
    <a-page-header style="border: 1px solid rgb(235, 237, 240)" title="基本信息" />

    <a-button @click="openInfoForm">
      <template #icon><PlusOutlined /></template>
      添加基金</a-button
    >

    <a-spin :spinning="infoLoading">
      <a-table :dataSource="infoState.dataSource" :columns="columns">
        <template #action="{ record }">
          <span>
            <a @click="openDailyForm(record)"><PlusOutlined /></a>
            <a-divider type="vertical" />
            <a><FormOutlined /></a>
            <a-divider type="vertical" />
            <a><DeleteOutlined style="color: #f5222d" /></a>
          </span>
        </template>
      </a-table>
    </a-spin>
  </a-space>

  <a-modal v-model:visible="visible" title="Basic Modal" @ok="handleOk">
    <p>Some contents...</p>
    <p>Some contents...</p>
    <p>Some contents...</p>
  </a-modal>
</template>
<script setup>
import { defineComponent } from "vue";
import { DeleteOutlined, FormOutlined, PlusOutlined } from "@ant-design/icons-vue";
import { defineProps, reactive, ref, toRaw } from "vue";
import { message } from "ant-design-vue";
import { useRoute, useRouter } from "vue-router";

const { ipcRenderer } = require("electron");
const router = useRouter();

const openInfoForm = () => {
  router.push("/info/form");
};

const visible = ref(false);
const infoLoading = ref(false);
const columns = ref(buildColumns());

const infoState = reactive({
  dataSource: []
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
  for (let i = 0; i < 5; i++) {
    now.setDate(now.getDate() - i);
    dates.push(formatDate(now));
  }
  return dates;
}
// ======= ./Date calculate ==================

function buildColumns() {
  let columns = [];
  columns.push({ title: "代码", dataIndex: "code", key: "code" });
  columns.push({ title: "基金", dataIndex: "alias", key: "title" });
  columns.push({ title: "操作", dataIndex: "action", slots: { customRender: "action" } });
  let dates = buildDateList();
  for (let index in dates) {
    let item = dates[index];
    columns.push({ title: item, dataIndex: item, key: item });
  }
  return columns;
}

// ======= load inforamtion ==================
infoLoading.value = true;
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
  infoLoading.value = false;
});
// ======= ./ load inforamtion ================

// ======= daily log ==========================
const handleOk = () => {
  visible.value = false;
};
const openDailyForm = (record) => {
  visible.value = true;
  console.log(record.code);
};
// ======= daily log ==========================
</script>
