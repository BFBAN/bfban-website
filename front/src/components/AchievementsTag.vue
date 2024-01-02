<template>
  <Row :gutter="5">
    <template v-if="data != {}">
      <block v-for="(i,index) in processingSortList.slice(0,maxOverflow)" :key="index">
        <Col v-if="getAchievements(i.value)['isShowCard']">
          <AchievementView :id="i.value" :onlyShow="true">
            <img :src="getIcon(getAchievements(i.value)['iconPath'])" :width="size" :height="size"/>
            <span slot="content">{{ $t(`profile.achievement.list.${i.value}.name`) }}</span>
          </AchievementView>
        </Col>
      </block>
      <Col v-if="processingSortList.length > maxOverflow">
        <Poptip trigger="hover">
          <Icon type="md-more"></Icon>
          <div slot="content">
            <Col v-for="(i,index) in processingSortList.slice(maxOverflow,processingSortList.length )" :key="index">
              <AchievementView :id="i.value.toString()" :onlyShow="true" v-if="getAchievements(i.value)['isShowCard']">
                <img :src="getIcon(getAchievements(i.value)['iconPath'])" :width="size" :height="size"/>
                <span slot="content">{{ $t(`profile.achievement.list.${i.value}.name`) }}</span>
              </AchievementView>
            </Col>
          </div>
        </Poptip>
      </Col>
    </template>
    <template v-else>
      <Empty :notHint="true"></Empty>
    </template>
  </Row>
</template>

<script setup>
import achievements from "/public/config/achievements.json"
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
    maxOverflow: {
      type: Number,
      default: 3
    }
  },
  data() {
    return {
      achievements,
      processingSortList: [],
    }
  },
  watch: {
    '$route': 'onSort'
  },
  components: {AchievementView},
  created() {
    this.onSort()
  },
  methods: {
    onSort() {
      Object.entries(this.data).forEach(i => {
        this.processingSortList.push({value: i[0], time: i[1]})
      });
      this.processingSortList.sort((a, b) => a.time > b.time)
    },
    getIcon(path) {
      if (path)
        return require(`/src/assets/images/achievement/${path}`);
    },
    /**
     * 获取成就信息
     * @param value
     */
    getAchievements(value) {
      let achievementInfo = {};
      if (!value && this.disabled) return;
      for (let index = 0; index < achievements.child.length; index++) {
        let i = achievements.child[index];
        if (!i.child && i.value === value)
          achievementInfo = i;
        else if (i.child && i.child.length > 0) {
          for (let jIndex = 0; jIndex < i.child.length; jIndex++) {
            let j = i.child[jIndex];
            if (j.value === value)
              achievementInfo = j;
          }
        }
      }
      return achievementInfo;
    }
  }
}
</script>

<style scoped lang="less">

</style>
