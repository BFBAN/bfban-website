<script>
import {nodeViewProps, NodeViewWrapper} from "@tiptap/vue-2";
import HtmlUser from "@/components/HtmlUser.vue";
import PrivilegesTag from "@/components/PrivilegesTag.vue";
import HtmlPlayerCard from "@/components/HtmlPlayerCard.vue";

export default {
  props: nodeViewProps,
  components: {
    HtmlPlayerCard,
    PrivilegesTag,
    HtmlUser,
    NodeViewWrapper
  },
  mounted() {
    if (this.node.attrs.csType === 'player')
      this.$refs.csRoot.$parent.$el.style.display = 'block';
  },
}
</script>

<template>
  <node-view-wrapper ref="csRoot" class="node-view" :as="'span'">
    <template v-if="node.attrs.csType === 'user'">
      <HtmlUser :id="node.attrs.csValue"></HtmlUser>
    </template>
    <template v-else-if="node.attrs.csType === 'router'">
      <router-link :to="{path: node.attrs.csValue}">
        <Icon type="md-link"></Icon>
        ({{ node.attrs.csValue }})
      </router-link>
    </template>
    <template v-else-if="node.attrs.csType === 'player'">
      <HtmlPlayerCard :id="node.attrs.csValue" style="display: block" contenteditable="false"></HtmlPlayerCard>
    </template>
    <template v-else-if="node.attrs.csType === 'privilege'">
      <PrivilegesTag :data="node.attrs.csValue"></PrivilegesTag>
    </template>
    <template v-else-if="node.attrs.csType === 'icon'">
      <Icon :type="node.attrs.csValue" :alt="node.attrs.csValue"></Icon>
    </template>
    <template v-else-if="node.attrs.csType === 'egg'">
      <Icon type="md-egg" contenteditable="false"></Icon>
    </template>
    <template v-else>
      <!--  不适合在编辑器内展示    -->
      {<b>{{ node.attrs.csType }}:{{ node.attrs.csValue }}</b>}
    </template>
  </node-view-wrapper>
</template>

<style scoped lang="less">
.node-view {
  display: inline-flex;
}
</style>
