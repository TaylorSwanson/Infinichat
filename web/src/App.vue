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
import { mapActions, mapGetters } from "vuex";

// Number of chars * size of char block
const gridSize = 16 * 20;
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
      widthX: 0,
      widthY: 0,
      chunkStartX: 0,
      lastChunkStartX: 0,
      chunkStartY: 0,
      lastChunkStartY: 0
    }
  },
  mounted() {
    this.dragTarget = document.getElementById("dragTarget");
    window.addEventListener("keydown", this.handleKeydown);

    this.connect();

    this.calcChunkCount();
    this.updateChunks();
  },
  computed: {
    ...mapGetters({
      socket: "getSocket",
      chunks: "getChunks",
      isConnected: "isConnected"
    }),
  },
  methods: {
    ...mapActions({
      connect: "connect",
      moveCursor: "moveCursor",
      placeChar: "placeChar",
      addChunk: "addChunk",
      removeChunk: "removeChunk",
    }),
    calcChunkCount() {
      // Quantity of chunks in each direction
      this.widthX = Math.ceil(window.innerWidth / gridSize % gridSize);
      this.widthY = Math.ceil(window.innerHeight / gridSize % gridSize);
      this.chunkStartX = Math.round(+this.dragTarget.style.left.slice(0, -2) / gridSize % gridSize);
      this.chunkStartY = Math.round(+this.dragTarget.style.top.slice(0, -2) / gridSize % gridSize);
    },
    updateChunks() {
      // ±1 Here to account for width of visible blocks too
      const minX = -this.chunkStartX - 1 - offscreenCount / 2;
      const minY = -this.chunkStartY - 1 - offscreenCount / 2;
      const maxX = minX + this.widthX + 1 + offscreenCount;
      const maxY = minY + this.widthY + 1 + offscreenCount;

      // Fill in screen, don't duplicate existing
      for (let x = minX; x < maxX; x++) {
        for (let y = minY; y < maxY; y++) {
          // Don't make duplicates
          if (this.chunks?.find(c => c.x === x && c.y === y)) {
            // Existing chunk
            continue;
          }

          this.addChunk({ x, y });
        }
      }

      // Clear chunks out of bounds
      this.chunks.forEach(chunk => {

        // Check if chunk position falls within rectangle of window
        const x = chunk.x;
        const y = chunk.y;

        if (x > minX && x < maxX && y > minY && y < maxY) return;

        this.removeChunk(chunk);
      });
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
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      // set the element's new position:
      this.dragTarget.style.left = (+this.dragTarget.style.left.slice(0, -2) + dx) + "px";
      this.dragTarget.style.top = (+this.dragTarget.style.top.slice(0, -2) + dy) + "px";

      this.calcChunkCount();
    },
    closeDragElement(event) {
      document.onmouseup = null;
      document.onmousemove = null;
    },
    handleKeydown(event) {
      console.log("kd", event);
      if (event.keyCode === 37) return this.moveCursor({ x: -1, y: 0 });
      if (event.keyCode === 38) return this.moveCursor({ x: 0, y: -1 });
      if (event.keyCode === 39) return this.moveCursor({ x: 1, y: 0 });
      if (event.keyCode === 40) return this.moveCursor({ x: 0, y: 1 });

      this.placeChar(event.key);
    }
  },
  watch: {
    // Only update when views change
    chunkStartX() { this.updateChunks(); },
    chunkStartY() { this.updateChunks(); },
    chunksX() { this.updateChunks(); },
    chunksY() { this.updateChunks(); },
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
  overflow: hidden

  .chunk-container
    position: absolute
    top: 0px
    right: 0px
    bottom: 0px
    left: 0px


</style>
