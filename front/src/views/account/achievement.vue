<template>
  <Tabs :value="'1'">
    <TabPane :label="$t('profile.achievement.title')" name="1">
      <template v-if="Object.keys(userAchievements).length > 0">
        <div style="margin: 10px 10px">
          <AchievementsTag :data="userAchievements"></AchievementsTag>
        </div>
        <Divider style="opacity: .4"></Divider>
      </template>

      <div class="profile-body">
        <Row :gutter="20" v-for="(i,index) in achievements.child.filter(i => !i.isHidden)" :key="index"
             class="achievement-item">
          <Col flex="1" style="width: 30%">
            <AchievementView :id="i.value" :disabled="i.child && i.child.length > 0">
              <h3>
                <b>
                  <template v-if="!i.child"><u>{{ $t(`profile.achievement.list.${i.value}.name`) }}</u></template>
                  <template v-else>{{ $t(`profile.achievement.list.${i.value}.name`) }}</template>
                </b>
              </h3>
              <p class="description" v-if="i.child" v-html="$t(`profile.achievement.list.${i.value}.description`)"></p>
              <p class="conditions">
                <span v-if="!i.child" v-html="$t(`profile.achievement.list.${i.value}.conditions`)"></span>
              </p>
              <template v-if="!i.child">
                <Tag type="border" :color="achievements.raritys[i.rarity].class">
                  {{ $t(`profile.achievement.rarity.${i.rarity}`) }}
                </Tag>
              </template>
              <Tag type="border" v-if="i.unlock">
                {{ $t('profile.achievement.acquisitionTime') }}
                <Time :time="i.unlock.acquisitionTime"></Time>
              </Tag>
            </AchievementView>
          </Col>
          <Col style="width: 70%;">
            <Card dis-hover>
              <template v-if="i.child">
                <Steps size="small">
                  <Step v-for="(i_c, i_cIndex) in i.child.slice(0,3)" :key="i_cIndex">
                    <template slot="icon" v-if="i_c.iconPath">
                      <img :src="getIcon(i_c.iconPath)" width="25px" height="25px"/>
                    </template>
                    <template slot="title">
                      <AchievementView :id="i_c.value">
                        <b><u>{{ $t(`profile.achievement.list.${i_c.value}.name`) }}</u></b>
                      </AchievementView>
                    </template>
                    <p style="max-width: 100px" slot="content">
                      {{ $t(`profile.achievement.list.${i_c.value}.description`) }}</p>
                  </Step>
                  <div class="more" v-if="i.child.length > 3">
                    <Poptip slot="content" transfer width="300">
                      <a href="javascript:void(0)">
                        <Icon type="md-more" size="20"/>
                      </a>
                      <Steps slot="content" direction="vertical">
                        <Step v-for="(i_more_c, i_more_cIndex) in i.child.slice(3,i.child.length)" :key="i_more_cIndex">
                          <img slot="icon" :src="getIcon(i_more_c.iconPath)" width="25px" height="25px"
                               v-if="i_more_c.iconPath"/>
                          <b slot="title">
                            <AchievementView :id="i_more_c.value">
                              {{ $t(`profile.achievement.list.${i_more_c.value}.name`) }}
                            </AchievementView>
                          </b>
                          <p style="max-width: 100px" slot="content">
                            {{ $t(`profile.achievement.list.${i_more_c.value}.description`) }}</p>
                        </Step>
                      </Steps>
                    </Poptip>
                  </div>
                </Steps>
              </template>
              <template v-else>
                <Steps size="small">
                  <Step>
                    <Icon slot="icon" type="md-radio-button-off"></Icon>
                    <span slot="title"></span>
                    <span slot="content"></span>
                  </Step>
                  <Step>
                    <div slot="icon" v-if="i.iconPath">
                      <AchievementView :id="i.value">
                        <img :src="getIcon(i.iconPath)" width="25px" height="25px"/>
                      </AchievementView>
                    </div>
                    <div slot="title" v-if="!i.child">{{ $t(`profile.achievement.list.${i.value}.name`) }}</div>
                    <div slot="content">
                      <p>{{ $t(`profile.achievement.list.${i.value}.description`) }}</p>
                    </div>
                  </Step>
                </Steps>
              </template>
            </Card>
          </Col>
        </Row>
      </div>
    </TabPane>
  </Tabs>
</template>

<script setup>
import achievements from "/public/config/achievements.json"

import AchievementView from "@/components/AchievementView.vue";
import AchievementsTag from "@/components/AchievementsTag.vue";
import {api, http_token} from "@/assets/js";

export default {
  data() {
    return {
      achievements: achievements,
      userAchievements: {}
    }
  },
  components: {AchievementView, AchievementsTag},
  created() {
    this.http = http_token.call(this);

    this.getUserAchievement()
  },
  methods: {
    /**
     * 获取用户成就列表
     */
    getUserAchievement() {
      this.http.get(api["account_achievements"]).then(res => {
        const d = res.data;

        if (d.success === 1) {
          this.userAchievements = d.data.achievements;
          for (let userAchievementIndex in Object.entries(this.userAchievements)) {
            let userAItem = Object.entries(this.userAchievements)[userAchievementIndex];
            const value = userAItem[1];
            const key = userAItem[0];

            for (let index = 0; index < this.achievements.child.length; index++) {
              let i = this.achievements.child[index];
              if (!i.child && i.value === key)
                i.unlock = {'key': key, 'acquisitionTime': value}
              else if (i.child)
                i.child.filter(j => {
                  if (j.value === key)
                    i.unlock = {'key': key, 'acquisitionTime': value}
                })
            }
          }
        }
      })
    },
    getIcon(path) {
      if (path)
        return require(`/src/assets/images/achievement/${path}`);
    }
  }
}
</script>

<style lang="less">
.ivu-steps.ivu-steps-small .ivu-steps-tail {
  top: 14px !important;
}

.ivu-steps.ivu-steps-small .ivu-steps-content {
  padding-left: 35px !important;
}

.ivu-steps.ivu-steps-small .ivu-steps-title {
  margin-bottom: 4px !important;
  margin-top: 5px !important;
}

.achievement-item {
  margin-bottom: 30px;

  .more {
    opacity: .8;
    margin: -16px -16px -16px 0 !important;
    display: flex;
    justify-self: center;
    align-items: center;
    min-height: calc(60px + 16px * 2);
    padding: 0 20px;
  }

  .more:hover {
    opacity: 1;
  }

  .description, .conditions {
    opacity: .8;
    margin: 3px 0;
    font-size: 12px;
  }

  .conditions {
    margin-bottom: 5px;
  }
}
</style>
