<template>
  <a-form ref="formRef" :model="formState" :rules="rules">
    <a-form-item has-feedback label="基金代码" name="code">
      <a-input v-model:value="code" :disabled="true" type="text" autocomplete="off" />
    </a-form-item>

    <a-form-item has-feedback label="基金别名" name="alias">
      <a-input v-model:value="alias" :disabled="true" type="text" autocomplete="off" />
    </a-form-item>

    <a-form-item has-feedback label="年月日" name="ymd">
      <a-date-picker v-model:value="formState.ymd" :format="'YYYYMMDD'" />
    </a-form-item>

    <a-form-item has-feedback label="今日变化金额" name="amount">
      <a-input v-model:value="formState.amount" type="text" autocomplete="off" />
    </a-form-item>

    <a-form-item label="记录类型" name="logType">
      <a-radio-group v-model:value="formState.logType">
        <a-radio v-for="(item, key) in logTypeList" :value="item.value">{{
          item.label
        }}</a-radio>
      </a-radio-group>
    </a-form-item>

    <a-form-item>
      <a-button type="primary" @click="onSubmit" :loading="saveLoading"
        ><template #icon><SaveOutlined /></template>保存</a-button
      >
    </a-form-item>
  </a-form>
</template>
<script>
import { defineComponent, reactive, ref, toRaw } from "vue";
import { RollbackOutlined, SaveOutlined } from "@ant-design/icons-vue";
import { useRoute, useRouter } from "vue-router";
import { message } from "ant-design-vue";
import moment from "moment";

const { ipcRenderer } = require("electron");
const logTypeList = [
  { value: 0, label: "日常" },
  { value: 1, label: "买入" },
  { value: 2, label: "卖出" },
  { value: 3, label: "分红" },
];

export default defineComponent({
  props: {
    code: String,
    alias: String,
    ymd: String,
  },
  watch: {
    ymd(nv) {
      this.formState.ymd = moment(nv, "YYYYMMDD");
    },
  },
  data() {
    return {
      saveLoading: false,
      logTypeList,
    };
  },
  setup(props) {
    const now = new Date();
    const formRef = ref();

    let validateAmount = async (rule, value) => {
      const regex = /^[-]{0,1}\d+(.\d{2})?$/;
      return regex.test(value)
        ? Promise.resolve()
        : Promise.reject("请输入创建时的金额，格式:00000.00");
    };

    const rules = {
      ymd: [
        {
          required: true,
          message: "请选择一个年月日",
          trigger: "change",
          type: "object",
        },
      ],
      amount: [
        { validator: validateAmount, trigger: "change" },
        { required: true, message: "请输入收益", trigger: "blur" },
      ],
    };
    let _ymd = props.ymd;
    const formState = reactive({
      ymd: moment(_ymd, "YYYYMMDD"),
      amount: "",
      logType: 0,
    });
    return {
      formRef,
      formState,
      rules,
    };
  },
  created() {
    const self = this;
    ipcRenderer.on("async-daliy-save-reply", (event, msg) => {
      self.saveLoading = false;
      message.success("已保存");
      this.$emit("reload");
    });
  },
  methods: {
    onSubmit() {
      this.saveLoading = true;
      let _v = toRaw(this.formState);
      this.formRef
        .validate()
        .then(() => {
          try {
            ipcRenderer.send("async-daliy-save", {
              code: this.code,
              ymd: _v.ymd.format("YYYYMMDD"),
              amount: _v.amount,
              logType: _v.logType
            });
          } catch (err) {
            console.log("exception-->", err);
          }
        })
        .catch(() => (this.saveLoading = false));
    },
  },
});
</script>
