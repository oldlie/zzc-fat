<template>
    <span :style="style">{{amount}}</span>
</template>
<script lang="ts">

import { defineComponent } from "vue";

export default defineComponent({
    props: {
        amount: String,
        color: String
    },
    data () {
        return {
            style: {"color" : this.color}  
        }
    },
    watch: {
        color (nv, ov) {
            this.style = {"color": nv}
        }
    }
});
</script>