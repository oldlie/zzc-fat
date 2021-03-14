<template>
  <a-space direction="vertical" style="width: 100%">
    <a-page-header
      style="border: 1px solid rgb(235, 237, 240)"
      title="基金分析"
      :sub-title="subTitle"
    />

    <div>
      <a-select
        v-model:value="currentFundInfo"
        style="width: 480px"
        ref="select"
        @change="handleFundsInfoChange"
      >
        <a-select-option v-for="item in fundsList" :value="item.code">{{
          item.alias
        }}</a-select-option>
      </a-select>

      <a-divider type="vertical" />

      <a-range-picker
        v-model:value="dateRange"
        format="YYYYMMDD"
        @ok="onChange"
        show-time
      />

      <a-divider type="vertical" />

      <a-radio-group name="radioGroup" v-model:value="filterZero">
        <a-radio value="0">过滤0收益的日期</a-radio>
        <a-radio value="1">不过滤</a-radio>
      </a-radio-group>

      <a-divider type="vertical" />

      <a-button type="primary" @click="handleAnalysis">分析</a-button>
    </div>

    <a-divider />

    <div ref="container"></div>
  </a-space>
</template>
<script lang="ts">
import { Chart } from "@antv/g2";
import { defineComponent, toRaw } from "vue";
import { message } from "ant-design-vue";
import moment from "moment";

const { ipcRenderer } = require("electron");

export default defineComponent({
  data() {
    return {
      subTitle: "总体分析",
      fundsList: [],
      currentFundInfo: "999999",
      dateRange: [],
      filterZero: "0",
      chart: {},
    };
  },
  created() {
    ipcRenderer.send("async-basic-info-list");
    ipcRenderer.once("async-basic-info-list-reply", (event, args) => {
      console.info("info list reply:", args);
      let { status, msg } = args;
      if (status === 0) {
        this.fundsList = args["data"];
      } else {
        message.error(msg);
      }
    });
  },
  mounted() {
    this.chart = new Chart({
      container: this.$refs.container,
      autoFit: true,
      height: 300,
    });

    ipcRenderer.on("async-daliy-list-by-code-and-date-range-reply", (event, args) => {
      let { status, msg, data } = args;
      let _data = data.map((item) => {
        let amount = item["amount"] + "";
        let length = amount.length - 2;
        amount = `${amount.substr(0, length)}.${amount.substr(length, 2)}`;
        return {
          ymd: item["ymd"] + "",
          amount: Number(amount),
        };
      });
      this.refreshChart(_data);
    });
    
  },
  methods: {
    refreshChart(data: Array<Object>) {
      this.chart.data(data);
      this.chart.scale({
        x: {
          type: "timeCat",
        },
        y: {
          type: "quantile",
          nice: true,
        },
      });
      this.chart.tooltip({
        showMarkers: false,
      });
      this.chart.interaction("active-region");
      this.chart.interval().position("ymd*amount");
      this.chart.render(true);
    },
    handleFundsInfoChange(value: Any, option: Option | Array<Option>) {
      let temps = this.fundsList.filter((item) => item.code === value);
      this.subTitle = temps[0]["alias"];
    },
    onChange(value: Moment[], dateString: string[]): void {
      this.dateRange = [value[0].format("YYYYMMDD"), value[1].format("YYYYMMDD")];
    },
    handleAnalysis() {
      ipcRenderer.send("async-daliy-list-by-code-and-date-range", {
        code: this.currentFundInfo,
        startYmd: this.dateRange[0],
        endYmd: this.dateRange[1],
        filterZero: this.filterZero,
      });
    },
  },
});
</script>
