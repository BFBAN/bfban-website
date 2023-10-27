<template>
  <div>
    <Avatar shape="square"
            icon="ios-person"
            :size="size"
            v-if="imageStatus != 1">
    </Avatar>
    <img :src="newSrc"
         :style="`width:${size}px;height:${size}px`"
         class="ivu-avatar ivu-avatar-square"
         v-show="imageStatus == 1"
         @load="imageStatus = 1"
         @error="loadImageError"/>
  </div>
</template>

<script>
export default {
  props: {
    size: {
      type: Number,
      default: 150
    },
    src: {
      type: String,
      default: ""
    },
  },
  data() {
    return {
      imageStatus: 0,
      newSrc: '',

      jxIndex: 0,
      jx: [
        "https://gravatar.loli.net/avatar/",
        "https://cdn.v2ex.com/gravatar/",
        "https://cdn.sep.cc/avatar/",
      ]
    }
  },
  watch: {
    src: {
      handler(value) {
        if (value)
          this.newSrc = value;
      }
    }
  },
  created() {
    this.newSrc = this.src;
  },
  methods: {
    loadImageError() {
      if (this.jxIndex >= -1) {
        // console.log(this.jxIndex, this.newSrc, this.jx[this.jxIndex])
        this.newSrc = this.newSrc.replaceAll(
            this.jxIndex == 0 ? 'https://www.gravatar.com/avatar/' : this.jx[this.jxIndex - 1],
            this.jx[this.jxIndex]
        )
        // console.log('result:', this.newSrc)
        this.jxIndex += 1;
      }
    },
  }
}
</script>

<style scoped lang="less">

</style>
