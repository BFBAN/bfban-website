<template>
  <Row :gutter="5">
    <template v-if="processingSortList.length >= 0">
      <Col v-for="(i,index) in processingSortList.slice(0,maxOverflow)" :key="index">
        <AchievementView :id="i.value" :time="i.time" :onlyShow="true">
          <img :src="achievementUtil.getIcon(achievementUtil.getItem(i.value)['iconPath'])" :width="size" :height="size"/>
          <span slot="content">{{ $t(`profile.achievement.list.${i.value}.name`) }}</span>
        </AchievementView>
      </Col>
      <Col v-if="processingSortList.length > maxOverflow">
        <Poptip trigger="hover">
          <Badge :count="processingSortList.slice(maxOverflow,processingSortList.length).length" :offset="[-5,-2]">
            <Icon type="md-more" :size="size.replace('px', '')"></Icon>
          </Badge>
          <template slot="content">
            <span v-for="(i,index) in processingSortList.slice(maxOverflow,processingSortList.length)" :key="index">
              <AchievementView :id="i.value.toString()" :time="i.time" :onlyShow="true"
                               v-if="achievementUtil.getItem(i.value)['isShowCard']">
                <img :src="achievementUtil.getIcon(achievementUtil.getItem(i.value)['iconPath'])" :width="size" :height="size"/>
                <span slot="content">{{ $t(`profile.achievement.list.${i.value}.name`) }}</span>
              </AchievementView>
            </span>
          </template>
        </Poptip>
      </Col>
    </template>
    <template v-else>
      <Empty :notHint="true"></Empty>
    </template>
  </Row>
</template>

<script setup>
import {achievement as achievementUtil} from "@/assets/js";

import Empty from "@/components/Empty.vue";
import AchievementView from "@/components/AchievementView.vue";

export default {
  props: {
    data: {
      type: [Object, Array],
      default() {
        return {}
      }
    },
    size: {
      type: String,
      default: '20px'
    },
    showAll: {
      type: Boolean,
      default: false
    },
    maxOverflow: {
      type: Number,
      default: 3
    }
  },
  data() {
    return {
      achievementUtil,

      processingSortList: [],
    }
  },
  watch: {
    '$route': 'onSort',
    'data': 'onSort',
  },
  components: {AchievementView},
  created() {
    this.onSort();
  },
  methods: {
    onSort() {
      this.processingSortList = Object.entries(this.data)
          .filter(([key]) => achievementUtil.getItem(key)['isShowCard'])
          .map(([value, time]) => ({value, time}))
          .sort((a, b) => a.time - b.time);
    },
  },
}
</script>

<style scoped lang="less">

</style>
