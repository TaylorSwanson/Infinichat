<template>
  
</template>

<script lang="ts">
import { defineComponent } from "vue";
import $axios from "@/classes/$axios";

import Block from "@/components/Block.vue";

export default defineComponent({
  name: "App",
  components: {
    Block
  },
  methods: {
    $axios,
  }
});
</script>

<style lang="sass">
#app
  font-family: "Inconsolata", monospace 
  -webkit-font-smoothing: antialiased
</style>
