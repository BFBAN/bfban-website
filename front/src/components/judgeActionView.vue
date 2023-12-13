<script setup>
import {util} from "@/assets/js";

export default {
  props: {
    judgeAction: {
      type: String,
      default: ''
    }
  },
  created() {
    const that = this;
    util.initUtil().then(res => {
      that.action = res.action;
    })
  },
  data () {
    return {
      util,

      action: [],
    }
  },
  methods: {
    getActionClass () {
      const unknownClass = '#535353';
      let actionFilter = this.action.filter(i => i.value == this.util.queryAction(this.judgeAction));
      if (actionFilter.length <= 0) return unknownClass;
      return actionFilter[0]['class'];
    }
  },
}
</script>

<template>
  <Poptip trigger="hover" :transfer="true" word-wrap width="200"
          :content="$t(`basic.action.${util.queryAction(judgeAction)}.describe`)">
    <Tag :color="getActionClass()">
      {{ $t(`basic.action.${util.queryAction(judgeAction)}.text`) }}
    </Tag>
  </Poptip>
</template>

<style scoped lang="less">

</style>
