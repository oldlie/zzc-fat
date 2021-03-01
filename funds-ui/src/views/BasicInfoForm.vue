<template>
  <a-space direction="vertical" style="width: 100%">
    <a-page-header style="border: 1px solid rgb(235, 237, 240)" title="基本信息" />

    <router-link to="/"> <RollbackOutlined />返回 </router-link>

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
      <a-form-item required has-feedback label="基金别名" name="alias">
        <a-input v-model:value="formState.alias" type="text" autocomplete="off" />
      </a-form-item>
      <a-form-item has-feedback label="初始金额" name="amount">
        <a-input prefix="￥" suffix="RMB" v-model:value="formState.amount" />
      </a-form-item>
      <a-form-item has-feedback label="基金风格" name="style">
        <a-checkbox-group v-model:value="formState.style" style="width: 600px">
          <template v-for="item in stylePool">
            <a-checkbox :value="item.id" name="style">{{ item.title }}</a-checkbox>
          </template>
        </a-checkbox-group>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="onSubmit" :loading="saveLoading"
          ><template #icon><SaveOutlined /></template>保存</a-button
        >
      </a-form-item>
    </a-form>
  </a-space>
</template>
<script setup>
import { defineProps, reactive, ref, toRaw } from "vue";
import { RollbackOutlined, SaveOutlined } from "@ant-design/icons-vue";
import { useRoute, useRouter } from "vue-router";
import { message } from "ant-design-vue";

const { ipcRenderer } = require("electron");

const route = useRoute();

const formRef = ref();
const stylePool = ref([]);
const saveLoading = ref(false);

const formState = reactive({
  code: "",
  title: "",
  alias: "",
  amount: "",
  style: [1, 2],
});

ipcRenderer.send("async-load-style-pool");
ipcRenderer.on("async-load-style-pool-reply", (event, arg) => {
  stylePool.value = arg;
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

let validateStyle = async (rule, value) => {
  return formState.style && formState.style.length > 0
    ? Promise.resolve()
    : Promise.reject("请选择基金风格");
};

const rules = {
  code: [{ validator: checkFundsCode, trigger: "change" }],
  title: [{ required: true, message: "请输入基金名称", trigger: "blur" }],
  alias: [{ required: true, message: "请输入基金别名，用于展示", trigger: "blur" }],
  amount: [{ validator: validateAmount, trigger: "change" }],
  style: [{ validator: validateStyle, trigger: "change" }],
};

function onSubmit() {
  saveLoading.value = true;
  formRef.value
    .validate()
    .then(() => {
      ipcRenderer.send("async-save-basic-info", toRaw(formState));
    })
    .catch((err) => {
      saveLoading.value = false;
    });
}
ipcRenderer.on("async-save-basic-info-reply", (event, args) => {
  saveLoading.value = false;
  message.success("已保存");
});
</script>
