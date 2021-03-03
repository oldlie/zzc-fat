<template>
  <a-form ref="formRef" :model="formState" :rules="rules">
    <a-form-item required has-feedback label="基金代码" name="code">
      <a-input v-model:value="code" :disabled="true" type="text" autocomplete="off" />
    </a-form-item>

    <a-form-item required has-feedback label="基金别名" name="alias">
      <a-input v-model:value="alias" :disabled="true" type="text" autocomplete="off" />
    </a-form-item>

    <a-form-item required has-feedback label="年月日" name="ymd">
      <a-date-picker v-model:value="formState.ymd" :format="'YYYYMMDD'" />
    </a-form-item>

    <a-form-item required has-feedback label="今日变化金额" name="amount">
      <a-input v-model:value="formState.amount" type="text" autocomplete="off" />
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

export default defineComponent({
  props: {
    code: String,
    alias: String,
    ymd: String,
  },
  setup(props) {
    const now = new Date();
    // const today = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
    const formRef = ref();
    const saveLoading = ref(false);

    let validateAmount = async (rule, value) => {
      const regex = /^\d+(.\d{1,2})?$/;
      return regex.test(value)
        ? Promise.resolve()
        : Promise.reject("请输入创建时的金额，格式:00000.00");
    };

    const rules = {
      ymd: [{ required: true, message: "请选择一个年月日", trigger: "blur" }],
      amount: [{ validator: validateAmount, trigger: "change" }],
    };

    const formState = reactive({
      ymd: props.ymd,
      amount: "",
    });
    return {
      formRef,
      saveLoading,
      formState,
      rules,
    };
  },
  methods: {
    onSubmit() {},
  },
});
</script>
