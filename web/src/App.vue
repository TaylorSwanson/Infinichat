<template lang="pug">
.drag-container(
  @mousedown="dragMouseDown"
  @mouseup="closeDragElement"
)
  .chunk-container(
    id="dragTarget"
  )
    p ASDF
    Chunk(
      v-for="chunk in chunks"
      :key="`${chunk.x}-${chunk.y}`"
      :chunk="chunk"
    )
</template>

<script lang="ts">
import { defineComponent } from "vue";

import Chunk from "@/components/Chunk.vue";

// Pixels before drag starts
const dragThreshold = 10;

let startX = 0;
let startY = 0;
let lastX = 0;
let lastY = 0;

function calcDistance(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  
  return Math.sqrt(dx * dx + dy + dy);
}

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
  methods: {
    dragMouseDown(event) {
      event.preventDefault();

      // Where the cursor is now
      startX = event.clientX;
      startY = event.clientY;
      lastX = event.clientX;
      lastY = event.clientY;
      
      document.onmousemove = this.elementDrag;
      document.onmouseup = this.closeDragElement;
    },
    elementDrag(event) {
      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;

      const dragDistance = calcDistance(
        event.clientX, event.clientY,
        dx, dy
      );

      lastX = event.clientX;
      lastY = event.clientY;

      if (dragDistance <= dragThreshold) {
        return event.preventDefault();
      }

      const dragTarget = document.getElementById("dragTarget") as HTMLElement;

      // set the element's new position:
      dragTarget.style.left = (+dragTarget.style.left.slice(0, -2) + dx) + "px";
      dragTarget.style.top = (+dragTarget.style.top.slice(0, -2) + dy) + "px";
    },
    closeDragElement() {
      document.onmouseup = null;
      document.onmousemove = null;
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

.drag-container
  width: 100vw
  height: 100vh
  position: fixed
  top: 0px
  left:0px
  position: relative

.chunk-container
  position: absolute
  top: 0px
  right: 0px
  bottom: 0px
  left: 0px
</style>
