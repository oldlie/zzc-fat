<template>
  <a-form ref="formRef" :model="formState" :rules="rules">
    <a-form-item has-feedback label="年月日" name="ymd">
      <a-date-picker v-model:value="formState.ymd" :format="'YYYYMMDD'" />
    </a-form-item>

    <a-form-item has-feedback label="今日变化金额" name="amount">
      <a-input v-model:value="formState.amount" type="text" autocomplete="off" />
    </a-form-item>

    <a-form-item>
      <a-button type="primary" @click="calculate" :loading="calculateLoading"
        ><template #icon><CalculatorOutlined /></template>计算</a-button
      >
    </a-form-item>
  </a-form>
</template>
<script lang="ts">
import { defineComponent, reactive, ref, toRaw } from "vue";
import { CalculatorOutlined } from "@ant-design/icons-vue";
import { message } from "ant-design-vue";
import moment from "moment";

const { ipcRenderer } = require("electron");

export default defineComponent({
  data () {
      return {
          calculateLoading: false
      }
  },
  setup() {
    const now = moment().format("YYYYMMDD");
    const formState = reactive({
      ymd: moment(now, "YYYYMMDD"),
      amount: "",
    });
    return {
        formState
    };
  },
  created() {
      ipcRenderer.on('async-calculate-all-reply', (event, result) => {
          if (result.status === 0) {
              this.formState.amount = this.formatAmount(result['data']);
          } else {
              message.error(data['message']);
          }
      });
  },
  methods: {
    calculate(): void {
        ipcRenderer.send('async-calculate-all', {ymd: this.formState.ymd.format("YYYYMMDD")});
    },
    formatAmount (amount: number): string {
        console.log(`format amount: ${amount}`);
        const amountStr: string = `${amount}`;
        const length: number = amountStr.length - 2;
        console.log(length);
        if (amount !== 0 && length < 0) {
            throw new Error(`金额记录错误:${amountStr}`);
        }
        console.log(`${amountStr.substring(0, length)}.${amountStr.substring(length)}`);
        return `${amountStr.substring(0, length)}.${amountStr.substring(length)}`;
    }
  },
});
</script>
