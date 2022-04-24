<template lang="pug">
.chunk-container(
  v-drag
)
  Chunk(
    v-for="chunk in chunks"
    :key="`${chunk.x}-${chunk.y}`"
    :chunk="chunk"
  )
</template>

<script lang="ts">
import { defineComponent } from "vue";

import Chunk from "@/components/Chunk.vue";

export default defineComponent({
  name: "App",
  data() {
    return {

    }
  },
  computed: {
    chunks() {
      return [];
    }
  },
  components: {
    Chunk
  },
});
</script>

<style lang="sass">
#app
  font-family: "Inconsolata", monospace 
  -webkit-font-smoothing: antialiased

.chunk-container
  position: absolute
  width: 100vw
  height: 100vh
  top: 0px
  left: 0px
</style>
