<template>
  <a-space direction="vertical" style="width: 100%">
    <a-page-header style="border: 1px solid rgb(235, 237, 240)" title="基本信息" />

    <a-button type="text">
      <template #icon><PlusOutlined /></template>
      返回</a-button
    >

    <a-form name="custom-validation" ref="formRef" :model="formState" :rules="rules">
      <a-form-item required has-feedback label="基金代码" name="code">
        <a-input v-model:value="formState.code" type="text" autocomplete="off" />
      </a-form-item>
      <a-form-item required has-feedback label="基金名称" name="title">
        <a-input
          style="width: 600px"
          v-model:value="formState.title"
          type="text"
          autocomplete="off"
        />
      </a-form-item>
      <a-form-item required has-feedback label="基金别名" name="alise">
        <a-input v-model:value="formState.alise" type="text" autocomplete="off" />
      </a-form-item>
      <a-form-item has-feedback label="初始金额" name="amount">
        <a-input prefix="￥" suffix="RMB" v-model:value="formState.amount" />
      </a-form-item>
    </a-form>
  </a-space>
</template>
<script setup>
import { defineProps, reactive, ref, toRaw } from "vue";
import { PlusOutlined } from "@ant-design/icons-vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();

const formRef = ref();
const formState = reactive({
  code: "",
  title: "",
  alise: "",
  amount: "",
});

let checkFundsCode = async (rule, value) => {
  const regex = /^\d{6}$/;
  return regex.test(value) ? Promise.resolve() : Promise.reject("请输入6位数字基金代码");
};

let validateAmount = async (rule, value) => {
  const regex = /^\d+(.\d{1,2})?$/;
  return regex.test(value)
    ? Promise.resolve()
    : Promise.reject("请输入创建时的金额，格式:00000.00");
};

const rules = {
  code: [
    { validator: checkFundsCode, trigger: "change" },
    { required: true, message: "请输入基金名称", trigger: "blur" },
  ],
  title: [{ required: true, message: "请输入基金名称", trigger: "blur" }],
  alise: [{ required: true, message: "请输入基金别名，用于展示", trigger: "blur" }],
  amount: [
    { validator: validateAmount, trigger: "change" },
    { required: true, message: "请输入基金名称", trigger: "blur" },
  ],
};
</script>
