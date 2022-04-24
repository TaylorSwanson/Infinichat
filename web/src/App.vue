<template lang="pug">
.drag-container(
  @mousedown="dragMouseDown"
  @mouseup="closeDragElement"
)
  .chunk-container(
    id="dragTarget"
  )
    Chunk(
      v-for="chunk in chunks"
      :key="`${chunk.x}x${chunk.y}`"
      :x="chunk.x"
      :y="chunk.y"
    )
</template>

<script>
import { defineComponent } from "vue";

import Chunk from "@/components/Chunk.vue";

// Number of chars * size of char block
const gridSize = 16 * 10;
// Number of chunks to load off screen in each direction
const offscreenCount = 2;

// Pixels before drag starts
const dragThreshold = 3;
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
      dragTarget: null,
      chunksX: 0,
      chunksY: 0,
      chunkStartX: 0,
      lastChunkStartX: 0,
      chunkStartY: 0,
      lastChunkStartY: 0,
      chunks: []
    }
  },
  mounted() {
    this.dragTarget = document.getElementById("dragTarget");

    // Create the first chunks
    this.generateChunks();
  },
  methods: {
    calcChunkCount() {
      // Quantity of chunks in each direction
      this.chunksX = Math.ceil(window.innerWidth / gridSize % gridSize);
      this.chunksY = Math.ceil(window.innerHeight / gridSize % gridSize);
      this.chunkStartX = Math.floor(- +this.dragTarget.style.left.slice(0, -2) % gridSize);
      this.chunkStartY = Math.floor(- +this.dragTarget.style.top.slice(0, -2) % gridSize);
    },
    generateChunks(skipChunks) {
      this.calcChunkCount();

      const startingVal = -(offscreenCount / 2);

      // Fill in remainder of the screen
      for (let i = startingVal; i < this.chunksY - startingVal; i++) {
        for (let j = startingVal; j < this.chunksX - startingVal; j++) {
          // Don't make duplicates
          if (skipChunks?.find(c => c.x === x && c.y === y)) return;

          this.chunks.push({ x: i, y: j });
        }
      }
    },
    // Less demanding way to load chunks and delete old ones
    // This keeps current chunks in place
    updateChunks() {


      // Add chunks in viewport that don't exist yet
      this.generateChunks(this.chunks);

      // // Delete chunks not in list
      // this.chunks.forEach(chunk => {
      //   if (!keepChunks.includes(chunk)) {
      //     const idx = this.chunks.indexOf(chunk);
      //     if (idx === -1) return;
          
      //     this.chunks.splice(idx, 1);
      //   }
      // });
    },
    dragMouseDown(event) {
      event.preventDefault();

      // Where the cursor is now
      lastX = event.clientX;
      lastY = event.clientY;
      
      document.onmousemove = this.elementDrag;
      document.onmouseup = this.closeDragElement;
    },
    elementDrag(event) {
      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;

      const dragDistance = Math.abs(calcDistance(
        lastX, lastY,
        event.clientX, event.clientY
      ));

      lastX = event.clientX;
      lastY = event.clientY;

      if (dragDistance <= dragThreshold) {
        return event.preventDefault();
      }

      // set the element's new position:
      this.dragTarget.style.left = (+this.dragTarget.style.left.slice(0, -2) + dx) + "px";
      this.dragTarget.style.top = (+this.dragTarget.style.top.slice(0, -2) + dy) + "px";

      this.updateChunks();
    },
    closeDragElement() {
      document.onmouseup = null;
      document.onmousemove = null;
    }
  },
  components: {
    Chunk
  }
});
</script>

<style lang="sass">
html, body 
  padding: 0px
  margin: 0px
  font-family: "Inconsolata", monospace

// #app

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
