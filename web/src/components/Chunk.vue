<template lang="pug">
.chunk(
  :style="chunkStyle"
)
  .char(
    v-for="(char, i) in chars"
    :key="i"
    :class="{ 'active': i === activeChar }"
    @keydown.native.prevent="handleKeydown($event, i)"
  ) {{ char }}
</template>

<script>
import { defineComponent } from "vue";
import { mapGetters } from "vuex";

const debounce = (fn, ms = 100) => {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  }.bind(this);
};

// Side length
const size = 16;
const gridSize = size * 10;

export default defineComponent({
  name: "Chunk",
  props: ["x", "y"],
  data() {
    return {
      activeChar: -1,
      startPosition: -1,
      queuedChanges: [],
      debounceUpdate: debounce(this.update),
      chunkStyle: {
        top: this.x + "px",
        left: this.y + "px"
      }
    }
  },
  created() {
    this.socket.send("");
  },
  computed: {
    ...mapGetters({
      socket: "getSocket"
    }),
    chars() {
      return this.chunk?.data?.map(d => d.char);
    },
    chunkStyle() {
      
    }
  },
  methods: {
    handleClick(i) {
      this.activeChar = i;
      this.startPosition = i;
    },
    handleKeydown(event, i) {
      event.stopPropagation();

      console.log("kd", event);

      // Move forward
      this.activeChar++;

      // // If this is a non-modifier, save the character
      // this.queuedChanges.push({
      //   i,
      //   char
      // })
      // this.debounceUpdate();
    },
    update() {
      this.queuedChanges = [];
    }
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="sass">

$size: 16

.chunk
  position: absolute
  width: $size * 10px
  height: $size * 10px
  left: 0px
  top: 0px
  box-shadow: 0px 0px 0px 1px #555

  .char
    width: 10px
    height: 10px
    line-height: 10px
    text-align: center

    &:hover, &.active
      box-shadow: 0px 0px 0px 1px inset rgba(#000, 0.1)

</style>
