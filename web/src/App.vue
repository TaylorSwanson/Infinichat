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
      :key="`${chunk.x}-${chunk.y}`"
      :x="chunk.x"
      :y="chunk.y"
    )
</template>

<script>
import { defineComponent } from "vue";

import Chunk from "@/components/Chunk.vue";

// Number of chars * size of char block
const gridSize = 16 * 10;
// Number of tiles to load off screen in each direction
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
      tilesX: 0,
      tilesY: 0,
      tilesStartX: 0,
      tilesStartY: 0,
      chunks: []
    }
  },
  mounted() {
    this.dragTarget = document.getElementById("dragTarget");
    this.calcTiles();
  },
  computed: {

  },
  methods: {
    calcTiles() {
      // Quantity of tiles in each direction
      this.tilesX = Math.ceil(window.innerWidth / gridSize % gridSize);
      this.tilesY = Math.ceil(window.innerHeight / gridSize % gridSize);
      this.tilesStartX = - +this.dragTarget.style.top.slice(0, -2) % gridSize * gridSize;
      this.tilesStartY = - +this.dragTarget.style.left.slice(0, -2) % gridSize * gridSize;

      this.chunks = [];
      for (let i = 0; i < this.tilesY; i++) {
        for (let j = 0; j < this.tilesX; j++) {
          this.chunks.push({
            x: i * gridSize,
            y: j * gridSize
          });
        }
      }
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

      this.calcTiles();

      // set the element's new position:
      this.dragTarget.style.left = (+this.dragTarget.style.left.slice(0, -2) + dx) + "px";
      this.dragTarget.style.top = (+this.dragTarget.style.top.slice(0, -2) + dy) + "px";
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
