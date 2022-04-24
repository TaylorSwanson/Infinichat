<template lang="pug">
.chunk(
  :style="chunkStyle"
)
  .char(
    v-for="(piece, i) in data"
    :key="i"
    :class="{ 'active': isChunkActive && i === activePiece.index }"
    @click.native.prevent="handleClick(i)"
  ) {{ piece.char }}
</template>

<script>
import { defineComponent } from "vue";
import { mapActions, mapGetters } from "vuex";

const debounce = (fn, ms = 100) => {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  }.bind(this);
};

// Side length
const size = 32;
const gridSize = size * 10;

export default defineComponent({
  name: "Chunk",
  props: ["x", "y"],
  data() {
    return {
      data: [],
      queuedChanges: [],
      debounceUpdate: debounce(this.update),
      chunkStyle: {
        top: this.y * gridSize + "px",
        left: this.x * gridSize + "px"
      },
      reconnectInterval: null
    }
  },
  created() {
    if (this.isConnected) {
      this.initialSetup();
    } else {
      // Retry setup over and over
      this.reconnectInterval = setInterval(() => {
        if (!this.isConnected) return;

        this.initialSetup();
        clearInterval(this.reconnectInterval);
        this.reconnectInterval = null;
      }, 1000);
    }
  },
  beforeUnmount() {
    this.socket.off("fullChunk", this.fullChunkHandler);

    clearInterval(this.reconnectInterval);
    this.reconnectInterval = null;
  },
  computed: {
    ...mapGetters({
      socket: "getSocket",
      isConnected: "isConnected",
      activePiece: "activePiece"
    }),
    chars() {
      return this.chunk?.data?.map(d => d.char);
    },
    isChunkActive() {
      return this.activePiece.x === this.x && this.activePiece.y === this.y;
    }
  },
  methods: {
    ...mapActions({
      setActive: "setActive"
    }),
    initialSetup() {
      this.socket.on("fullChunk", this.fullChunkHandler);
      this.socket.emit("get", { x: this.x, y: this.y });
    },
    fullChunkHandler(chunk) {
      if (chunk.x === this.x && chunk.y === this.y) {
        this.data = chunk.data;
      }
    },
    handleClick(i) {
      this.setActive({
        x: this.x,
        y: this.y,
        index: i
      })
    }
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="sass">

$size: 16

.chunk
  position: absolute
  width: $size * 20px
  height: $size * 20px
  left: 0px
  top: 0px
  overflow: hidden

  .char
    width: 20px
    height: 20px
    overflow: hidden
    line-height: 20px
    text-align: center
    display: inline-block
    float: left

    &:hover
      box-shadow: 0px 0px 0px 1px inset rgba(#000, 0.4)

    &.active
      background-color: #F2F5F9

    

</style>
