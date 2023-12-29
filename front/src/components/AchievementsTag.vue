<template>
  <div>
    <template v-if="data != {}">
      <span v-for="(i,index) in Object.entries(data)" :key="index">
        <Poptip transfer trigger="hover">
          <img :src="getIcon(getAchievements(i[0])['iconPath'])" width="25px" height="25px"/>
          <span slot="content">{{ $t(`profile.achievement.list.${i[0]}.name`) }}</span>
        </Poptip>
      </span>
    </template>
    <template v-else>
      <Empty :notHint="true"></Empty>
    </template>
  </div>
</template>

<script setup>
import achievements from "/public/config/achievements.json"
import Empty from "@/components/Empty.vue";

export default {
  props: {
    data: {
      type: [Object, Array],
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      achievements,
    }
  },
  methods: {
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
        else if (i.child)
          i.child.filter(j => {
            if (j.value === value)
              achievementInfo = j;
          })
      }
      return achievementInfo;
    }
  }
}
</script>

<style scoped lang="less">

</style>
