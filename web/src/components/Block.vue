<template lang="pug">
.block(

)
  .char(
    v-for="char in chars"
  ) {{ char }}
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapGetters } from "vuex";

export default defineComponent({
  name: "Block",
  props: ["chunk"],
  data() {
    return {
      
    }
  },
  created() {
    
  },
  computed: {
    ...mapGetters({
      socket: "getSocket"
    }),
    chars() {
      return this.chunk?.data?.map(d => d.char);
    }
  },
  methods: {
    
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="sass">

$size: 16

.block
  position: absolute
  width: $size * 10px
  height: $size * 10px
  left: 0px
  top: 0px

  .char
    width: 10px
    height: 10px
    line-height: 10px
    text-align: center

    &:hover
      box-shadow: 0px 0px 0px 1px inset rgba(#000, 0.1)

</style>
