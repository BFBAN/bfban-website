<template>
  <Poptip width="300" transfer :disabled="disabled">
    <slot></slot>
    <div slot="content" class="achievement-view">
      <h3>
        <Row :gutter="10">
          <Col>
            <img :src="achievementInfo.iconParh" v-if="achievementInfo.iconParh" width="25px" height="25px"/>
            <b>{{ $t(`profile.achievement.list.${achievementInfo.value}.name`) }}</b>
          </Col>
          <Col>
            <Tag type="border" :color="achievements.raritys[achievementInfo.rarity].class" v-if="achievementInfo.rarity">
              {{ $t(`profile.achievement.rarity.${achievementInfo.rarity}`) }}
            </Tag>
          </Col>
        </Row>
      </h3>
      <p class="achievement-view-description">{{ $t(`profile.achievement.list.${achievementInfo.value}.description`) }}</p>
      <p><b>{{ $t('profile.achievement.conditions') }}</b></p>
      <p class="achievement-view-conditions" v-html="$t(`profile.achievement.list.${achievementInfo.value}.conditions`)"></p>
      <template v-if="achievementInfo.acquisition.indexOf('active') >= 0 && activeButton">
        <Button long :loading="load" @click="onActiveAchievement(achievementInfo.value)">
          {{ $t('profile.achievement.getButton')}}
        </Button>
      </template>
    </div>
  </Poptip>
</template>

<script setup>
import achievements from "/public/config/achievements.json"
import {api, http_token} from "@/assets/js";

export default {
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    id: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      achievements,

      load: false,
      activeButton: true,
      achievementInfo: {
        acquisition: []
      }
    }
  },
  created() {
    this.http = http_token.call(this);

    this.getAchievements(this.id)
  },
  methods: {
    /**
     * 主动获取成就
     */
    onActiveAchievement(id) {
      if (id && this.load) return;

      this.load = true;
      this.http.post(api["account_achievement"], {
        data: {id}
      }).then(res => {
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
      })
    },
    /**
     * 获取成就信息
     * @param value
     */
    getAchievements(value) {
      if (!value && this.disabled) return;
      for (let index = 0; index < achievements.child.length; index++) {
        let i = achievements.child[index];
        if (!i.child && i.value === value)
          this.achievementInfo = i;
        else if (i.child)
          i.child.filter(j => {
            if (j.value === value)
              this.achievementInfo = j;
          })
      }
    }
  }
}
</script>

<style scoped lang="less">
.achievement-view {
  .achievement-view-description {
    margin-bottom: 10px;
    opacity: .8;
  }

  .achievement-view-conditions {
    margin: 10px 0;
  }
}
</style>
