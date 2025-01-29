<script setup>
import {util} from "@/assets/js";

export default {
  props: {
    status: {
      type: Number,
      default: 0
    }
  },
  data() {
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
    async loadData() {
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
      const unknownClass = '#535353';
      if (status == null) return unknownClass;
      let resultStatusObjects = this.cheaterStatus.filter((i) => i.value == status);
      if (resultStatusObjects.length <= 0) return unknownClass;
      return resultStatusObjects[0]['class'] || unknownClass;
    }
  }
}
</script>

<template>
  <Tag :color="cheaterStatusClass(status || 0)" v-if="status >= 0">
    {{ $t(`basic.status.${status || 0}.text`) }}
    <span class="judge-action-before-icon">
     <Poptip trigger="hover" :transfer="true" word-wrap width="200"
             :content="$t(`basic.status.${status || 0}.describe`)">
       <Icon type="md-help"></Icon>
     </Poptip>
    </span>
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
