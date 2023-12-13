<script setup>
import {util} from "@/assets/js";

export default {
  props: {
    status: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      util,

      cheaterStatus: [],
    }
  },
  watch: {
    '$route': 'loadData',
  },
  created() {
    this.loadData();
  },
  methods: {
    async loadData () {
      await util.initUtil().then(res => {
        this.cheaterStatus = res.cheaterStatus;
      });
    },
    /**
     * 区配玩家状态样式
     * @param status
     * @returns {*|string|string}
     */
    cheaterStatusClass(status) {
      const unknownClass = '#000';
      if (!status) return unknownClass;
      let resultStatusObjects = this.cheaterStatus.filter((i) => i.value == status);
      if (resultStatusObjects.length <= 0) return unknownClass;
      return resultStatusObjects[0]['class'] || unknownClass;
    }
  }
}
</script>

<template>
  <Poptip trigger="hover" :transfer="true" word-wrap width="200"
          :content="$t(`basic.status.${status || 0}.describe`)">
    <Tag :color="cheaterStatusClass(status || 0)" v-if="status >= 0">
      {{ $t(`basic.status.${status || 0}.text`) }}
    </Tag>
  </Poptip>
</template>

<style scoped lang="less">

</style>
