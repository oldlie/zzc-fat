<template>
  <a-space direction="vertical" style="width: 100%">
    <a-page-header style="border: 1px solid rgb(235, 237, 240)" title="基本信息" />

    <div>
      <a-button @click="openInfoForm">
        <template #icon><PlusOutlined /></template>
        添加基金</a-button
      >

      <!--
      <a-button @click="openCalculateForm">
        <template #icon><CalculatorOutlined /></template>
        计算收益</a-button
      >
      -->

      <a-divider type="vertical" />
      <a-input-search
        v-model:value="searchValue"
        placeholder="输入基金代码"
        style="width: 200px"
        @search="onSearch"
      />
    </div>

    <a-spin :spinning="infoLoading">
      <a-table :dataSource="infoState.dataSource" :columns="columns">
        <template #action="{ record }">
          <span v-if="record.code !== '999999'">
            <a @click="openDailyForm(record)"><PlusOutlined /></a>
          </span>
        </template>
        <template #code="{ record }">
          <span v-if="record.code !== '999999'">
            {{ record.code }}
          </span>
        </template>
        <template #alias="{ record }">
          <span v-if="record.code !== '999999'">
            {{ record.alias }}
            <a-divider type="vertical" />
            <router-link :to="`/calendar?code=${record.code}`"
              ><CalendarOutlined
            /></router-link>
            <a-divider type="vertical" />
            <a @click="editFundInfo(record)"><FormOutlined /></a>
            <a-divider type="vertical" />
            <a-popconfirm
              title="谨慎选择删除，一旦执行将会删除所有与本基金相关数据?"
              ok-text="是"
              cancel-text="否"
              @confirm="confirmDelete(record)"
              @cancel="cancelDelete(record)"
            >
              <a><DeleteOutlined style="color: #f5222d" /></a>
            </a-popconfirm>
          </span>
        </template>
      </a-table>
    </a-spin>
  </a-space>

  <a-modal v-model:visible="visible" title="添加记录" :footer="null">
    <FundDaliyLog
      :code="daliyState.code"
      :ymd="daliyState.ymd"
      :alias="daliyState.alias"
      @reload="reload"
    />
  </a-modal>

  <a-modal v-model:visible="calculateVisible" title="计算收益" :footer="null">
    <CalculateForm />
  </a-modal>
</template>
<script setup>
import { defineComponent } from "vue";
import {
  CalculatorOutlined,
  CalendarOutlined,
  DeleteOutlined,
  FormOutlined,
  PlusOutlined,
} from "@ant-design/icons-vue";
import { defineProps, reactive, ref, toRaw } from "vue";
import { message } from "ant-design-vue";
import { useRoute, useRouter } from "vue-router";

import CalculateForm from "../components/Calucate.vue";
import FundDaliyLog from "../components/FundDaliyLog.vue";

const { ipcRenderer } = require("electron");
const router = useRouter();

const openInfoForm = () => {
  router.push("/info/form");
};

function editFundInfo(record) {
  router.push(`/info/form?code=${record.code}`);
}

const visible = ref(false);
const infoLoading = ref(false);
const columns = ref(buildColumns());
const calculateVisible = ref(false);
const searchValue = ref("");

const daliyState = reactive({
  code: "",
  ymd: "",
  alias: "",
});

const infoState = reactive({
  dataSource: [],
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
  for (let i = 0; i < 7; i++) {
    dates.push(formatDate(now));
    now.setDate(now.getDate() - 1);
  }
  return dates;
}
// ======= ./Date calculate ==================

function buildColumns() {
  let columns = [];
  columns.push({ title: "", dataIndex: "action", slots: { customRender: "action" } });
  columns.push({ title: "代码", dataIndex: "code", slots: { customRender: "code" } });
  columns.push({ title: "基金", dataIndex: "alias", slots: { customRender: "alias" } });
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
          let ymd = Number(_daliy["ymd"]);
          let amount = `${_daliy["funds_amount"]}`;
          if (amount !== "0") {
            let _l = amount.length - 2;
            amount = `${amount.substring(0, _l)}.${amount.substring(_l)}`;
          }
          if (_ymd === ymd) {
            _item[_ymd] = amount;
            found = true;
            break;
          }
        }
        if (!found) {
          _item[_ymd] = 0;
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
  const now = new Date();
  let ymdInt = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
  daliyState.code = record.code;
  daliyState.alias = record.alias;
  daliyState.ymd = `${ymdInt}`;
};
// ======= daily log ==========================

const cancelDelete = (record) => {
  // message.success("Click on Yes");
};
const confirmDelete = (record) => {
  ipcRenderer.send("async-basic-info-delete", { code: record.code });
};
ipcRenderer.on("async-daliy-delete-reply", (event, args) => {
  let { status, msg: message } = args;
  if (status === 0) {
    message.success("已删除");
    ipcRenderer.send("async-info-reply");
  } else {
    message.error(msg);
  }
});

const openCalculateForm = () => {
  calculateVisible.value = true;
};

const onSearch = () => {
  ipcRenderer.send("async-info", { code: searchValue.value });
};

const reload = () => {
  ipcRenderer.send("async-info");
};
</script>
