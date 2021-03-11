<template>
  <a-space direction="vertical" style="width: 100%">
    <a-page-header
      style="border: 1px solid rgb(235, 237, 240)"
      title="基金日历"
      :sub-title="fundState.info.alias"
    />

    <div>
      <a-row :gutter="24">
        <a-col :span="8">
          <a-card>
            <a-statistic
              title="月收益"
              :value="fundState.info.total"
              :precision="2"
              prefix="￥"
              :value-style="{ color: fundState.info.total > 0 ? '#cf1322' : '#3f8600' }"
              class="demo-class"
            >
              <template #prefix>
                <arrow-down-outlined />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="8">
          <a-card>
            <a-statistic
              title="上涨天数"
              :value="fundState.info.upDates"
              :precision="0"
              :value-style="{ color: '#cf1322' }"
              style="margin-right: 50px"
            >
              <template #prefix>
                <arrow-up-outlined />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :span="8">
          <a-card>
            <a-statistic
              title="下跌天数"
              :value="fundState.info.downDates"
              :precision="0"
              class="demo-class"
              :value-style="{ color: '#3f8600' }"
            >
              <template #prefix>
                <arrow-down-outlined />
              </template>
            </a-statistic>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <a-calendar v-model:value="value" @select="openPlusForm" @change="onChange">
      <template #dateCellRender="{ current: value }">
        <CalendarLabel
          :amount="getListData(value)['amount']"
          :color="getListData(value)['color']"
        />
      </template>
    </a-calendar>
  </a-space>

  <a-modal v-model:visible="visible" title="添加记录" :footer="null">
    <FundDaliyLog
      :code="daliyState.code"
      :ymd="daliyState.ymd"
      :alias="daliyState.alias"
      @reload="reload"
    />
  </a-modal>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  CalculatorOutlined,
  CalendarOutlined,
  DeleteOutlined,
  FormOutlined,
  PlusOutlined,
} from "@ant-design/icons-vue";
import { defineProps, reactive, ref, toRaw } from "vue";
import { message } from "ant-design-vue";
import { useRoute, useRouter } from "vue-router";
import "moment/dist/locale/zh-cn";
import moment from "moment";
moment.locale("zh-cn");
import CalendarLabel from "../components/CalendarLabel.vue";
import FundDaliyLog from "../components/FundDaliyLog.vue";

const { ipcRenderer } = require("electron");
const router = useRouter();

export default defineComponent({
  data() {
    return {
      visible: false,
    };
  },
  components: {
    ArrowUpOutlined,
    ArrowDownOutlined,
    CalendarLabel,
    FundDaliyLog,
  },
  setup() {
    const value = ref(moment().format("YYYYMMDD"));
    const route = useRoute();
    const fundState = reactive({
      info: {},
      data: {},
    });
    const daliyState = reactive({
      code: "",
      ymd: "",
      alias: "",
    });
    let code = route.query.code;
    let ymd = value.value;
    ipcRenderer.send("async-daliy-list", { code: code, ymd: ymd });

    if (!ER.events["async-daliy-list-reply"]) {
      ER.events["async-daliy-list-reply"] = true;
      ipcRenderer.on("async-daliy-list-reply", (event, response) => {
        const { status, msg, data } = response;
        if (status === 0) {
          let amountList = data[1];
          let _data = {};
          for (let index in amountList) {
            let item = amountList[index];
            let _amount = `${item["amount"]}`;
            let _length = _amount.length - 2;
            _data[item["date"]] = `${_amount.substring(0, _length)}.${_amount.substring(
              _length
            )}`;
          }
          fundState.info = {
            code: code,
            alias: data[0][0]["alias"],
            upDates: data[2][0]["up"],
            downDates: data[3][0]["down"],
            total: data[4][0]["total"] / 100,
          };
          fundState.data = _data;
        } else {
          message.error(msg);
        }
      });
    }
    
    return {
      daliyState,
      fundState,
      value,
    };
  },
  mounted() {},
  methods: {
    openPlusForm(value: Moment): void {
      let info = toRaw(this.fundState.info);
      this.daliyState.code = info.code;
      this.daliyState.ymd = value.format("YYYYMMDD");
      this.daliyState.alias = info.alias;
      this.visible = true;
    },
    reload(): void {
      let info = toRaw(this.fundState.info);
      ipcRenderer.send("async-daliy-list", {
        code: info.code,
        ymd: moment().format("YYYYMMDD"),
      });
    },
    getListData(value: Moment): Any {
      let temp = toRaw(this.fundState.data);
      let amount = temp[value.format("YYYYMMDD")];
      let color = Number(amount) >= 0 ? "#f5222d" : "#389e0d";
      return { amount, color };
    },
    onChange(value: Moment): void {
      let ymd = value.format("YYYYMMDD");
      ipcRenderer.send("async-daliy-list", { code: this.fundState.info.code, ymd: ymd });
    },
  },
});
</script>
