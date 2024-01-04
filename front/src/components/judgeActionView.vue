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
  <Tag :color="getActionClass()">
    {{ $t(`basic.action.${util.queryAction(judgeAction)}.text`) }}
    <Poptip trigger="hover" :transfer="true" word-wrap width="200"
            :content="$t(`basic.action.${util.queryAction(judgeAction)}.describe`)">
      <span class="judge-action-before-icon">
        <Icon type="md-help"></Icon>
      </span>
    </Poptip>
  </Tag>
</template>

<style scoped lang="less">
.judge-action-before-icon {
  cursor: help;
  display: inline-block;
  margin: -2px -8px 0px 5px;
  padding: 0px 3px;
  background-color: rgba(0, 0, 0, 0.08);
}
</style>
