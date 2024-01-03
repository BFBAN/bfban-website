<template>
  <Poptip :width="300" :trigger="trigger" transfer :disabled="disabled" padding="0">
    <span class="achievement-view-slot"><slot></slot></span>
    <div slot="content" class="achievement-view">
      <Banner :height="160">
        <div align="center">
          <Avatar :size="50" shape="square" :src="achievementUtil.getIcon(achievementInfo.iconPath)"
                  v-if="achievementInfo.iconPath" width="35px" height="35px"/>
        </div>

        <h3 class="achievement-view-body achievement-view-title">
          <Row :gutter="10" type="flex" align="middle">
            <Col>
              <b :title="achievementInfo.value">{{ $t(`profile.achievement.list.${achievementInfo.value}.name`) }}</b>
            </Col>
            <Col>
              <Tag type="border" :color="achievements.raritys[achievementInfo.rarity].class"
                   v-if="achievementInfo.rarity">
                {{ $t(`profile.achievement.rarity.${achievementInfo.rarity}`) }}
              </Tag>
              <Tag type="border" v-if="time">
                {{ $t('profile.achievement.acquisitionTime') }}
                <TimeView :time="time">
                  <Time :time="time"></Time>
                </TimeView>
              </Tag>
            </Col>
          </Row>
        </h3>
      </Banner>
      <div class="achievement-view-body">
        <p class="achievement-view-description">{{
            $t(`profile.achievement.list.${achievementInfo.value}.description`)
          }}</p>
        <p><b>{{ $t('profile.achievement.conditions') }}</b></p>
        <p class="achievement-view-conditions"
           v-html="$t(`profile.achievement.list.${achievementInfo.value}.conditions`)"></p>
        <template
            v-if="achievementInfo.acquisition && achievementInfo.acquisition.indexOf('active') >= 0 && activeButton && !onlyShow">
          <Button long ghost type="primary" :loading="load" @click="onActiveAchievement(achievementInfo.value)">
            {{ $t('profile.achievement.getButton') }}
          </Button>
        </template>
      </div>
    </div>
  </Poptip>
</template>

<script setup>
import {achievement as achievementUtil} from "@/assets/js";

import achievements from "/public/config/achievements.json";

import Banner from "@/components/Banner.vue";
import TimeView from "@/components/TimeView.vue";

export default {
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    trigger: {
      type: String,
      default: 'click'
    },
    onlyShow: {
      type: Boolean,
      default: false,
    },
    time: {
      type: [String, Number],
      default: ''
    },
    id: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      achievementUtil,
      achievements,

      load: false,
      activeButton: true,
      achievementInfo: {
        acquisition: []
      }
    }
  },
  components: {Banner, TimeView},
  created() {
    this.getCurrentAchievementInfo(this.id)
  },
  methods: {
    /**
     * 主动获取成就
     * @param id
     */
    async onActiveAchievement(id) {
      if (!id || this.load) return;

      this.load = true;
      await achievementUtil.onActiveAchievement(id).then(res => {
        const d = res.data;

        if (d.success === 1) {
          this.activeButton = false;
          this.$Message.success(this.$t(`basic.tip['${d.code}']`));
          return;
        }

        this.$Message.error(this.$t(`basic.tip['${d.code}']`, {
          message: d.message || ""
        }));
      }).finally(() => {
        this.load = false;
      });
    },
    /**
     * 获取成就信息
     * @param value
     */
    getCurrentAchievementInfo(value) {
      if (value)
        this.achievementInfo = achievementUtil.getItem(value);
    },
  }
}
</script>

<style scoped lang="less">
.achievement-view-slot {
  cursor: pointer;
}

.achievement-view {
  .achievement-view-title {
    text-align: center;
  }

  .achievement-view-body {
    padding: 10px 16px;
  }

  .achievement-view-description {
    margin-bottom: 10px;
    opacity: .6;
  }

  .achievement-view-conditions {
    margin: 10px 0;
  }
}
</style>
