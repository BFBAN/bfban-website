<template>
  <div>
    <div class="list">
      <div v-for="(d, d_index) in list" :key="d.originUserId" class="item-card">
        <Badge :text=" d.viewNum > 100 && d.commentsNum > 10 ? 'hot': ''" style="width: 100%">
          <Card dis-hover :padding="10">
            <Row :gutter="10" type="flex">
              <Col :xs="{span: 8, push: 0,pull:0}" :lg="{span: 3, push: 0,pull:0}">
                <!-- 头像 S -->
                <Avatar :src="d.avatarLink"
                        @on-error="onAvatarError(d_index)"
                        alt="avatar"
                        size="55"
                        v-if="d.avatarLink">
                </Avatar>
                <template v-else>
                  <Avatar icon="ios-person"
                          size="55"
                          style="background-color: rgba(255,0,0,0.37)"></Avatar>
                </template>
                <!-- 头像 E -->
              </Col>
              <Col :xs="{span: 17, push: 0,pull:0}" :lg="{span: 17, push: 0,pull:0}">
                <div style="display: flex; flex-direction: column;">
                  <Tooltip :content="$t('list.colums.playerId')">
                    <h2>
                      <router-link :to="{name: 'player', params: { ouid: `${d.originPersonaId}` }}"
                                   :style="d.avatarLink == '' ? 'color: rgba(255,0,0,1);text-decoration: line-through;' : ''">
                        {{ d.originName }}
                      </router-link>
                      <Button size="small" type="text" icon="ios-copy-outline" :data-clipboard-text="d.originId"></Button>
                    </h2>
                  </Tooltip>
                </div>

                <div>
                  {{ $t('list.colums.reportTime') }}
                  <Time v-if="d.createTime" :time="d.createTime"/>
                  <Divider type="vertical"/>
                  {{ $t('list.colums.updateTime') }}
                  <Time v-if="d.updateTime" :time="d.updateTime"/>
                </div>
              </Col>
              <Col :xs="{span: 24, push: 0,pull:0}" :lg="{span: 3, push: 0,pull:0}" class="mobile-hide">
                <Row type="flex" justify="end" align="middle" style="height: 100%">
                  <Col flex="auto" align="right" class="item-text">
                    <span>{{ d.viewNum || 0 }}</span>
                    <Icon type="md-eye" size="17" class="item-icon"/>
                  </Col>
                  <Col flex="auto" align="right" class="item-text">
                    <span>{{ d.commentsNum || 0 }}</span>
                    <Icon type="md-chatboxes" size="17" class="item-icon"/>
                  </Col>
                </Row>
              </Col>
              <Col :xs="{span: 24, push: 0,pull:0}" :lg="{span: 1, push: 0,pull:0}"
                   align="center"
                   class="mobile-hide">
                <Progress vertical :percent="d.status == 1 ? 99 : 100" hide-info status="wrong"/>
              </Col>
            </Row>
          </Card>
        </Badge>
      </div>
    </div>
    <div v-if="list.length <= 0">{{ $t('basic.tip.notcontent') }}</div>
  </div>
</template>

<script>
import {api, http, http_token, storage} from "../../assets/js";

export default {
  data() {
    return {
      list: [],
    }
  },
  created() {
    this.http = http_token.call(this);

    this.getHisory();
  },
  methods: {
    /**
     * 取得历史列表
     */
    async getHisory () {
      let loaclData = storage.get('viewed');

      if (loaclData.code >= 0) {
        for (const key in loaclData.data.value) {
          let d = await this.getCheatersInfo(key);

          if (d.data.success == 1){
            this.list.push(d.data.data);
          }
        }
      }
    },
    /**
     * 获取作弊者档案
     */
    async getCheatersInfo(dbId) {
      this.cheater = {};

      return await this.http.get(api["cheaters"], {
        params: Object.assign({
          history: true
        }, { dbId })
      });
    },
  }
}
</script>

<style lang="less" scoped>
@import "./src/assets/css/radio.less";

.list {
  position: relative;

  .item-card {
    margin-bottom: 10px;
  }

  .item-text {
    white-space: nowrap;
    font-size: 12px;
    font-weight: 400;
  }

  .item-icon {
    margin: 0 20px 0 5px;
  }
}
</style>