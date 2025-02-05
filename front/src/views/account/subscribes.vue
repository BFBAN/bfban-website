<template>
  <div class="profile-body" v-if="$store.state.configuration.subscribes">
    <Row :gutter="10" class="history-buttons" type="flex" justify="center">
      <Col flex="1">
        <Checkbox v-model="checkboxAll" :disabled="list.length <= 0" @on-change="onCheckboxAll"></Checkbox>
        <Divider type="vertical"/>
        <Button @click="onDelete" :disabled="list.length <= 0" size="small">
          <Icon type="md-trash"/>
        </Button>
      </Col>
      <Col>
        {{ list.length }} / 5000
        <Divider type="vertical"/>
        <Button @click="getSubscribes" size="small">
          <Icon type="md-refresh" :class="[load ? 'spin-icon-load' :'']"/>
        </Button>
      </Col>
    </Row>

    <br>

    <div class="list">
      <div v-for="(d, d_index) in list" :key="d_index" class="item-card">
        <Row :gutter="10" type="flex" justify="center" align="middle">
          <Col>
            <Checkbox v-model="d.checkbox"></Checkbox>
          </Col>
          <Col flex="1">
            <Card dis-hover :padding="10">
              <Row :gutter="10" type="flex">
                <Col :xs="{span: 8, push: 0,pull:0}" :lg="{span: 3, push: 0,pull:0}">
                  <!-- 头像 S -->
                  <Avatar :src="d.avatarLink"
                          alt="avatar"
                          size="55"
                          v-if="d.avatarLink">
                  </Avatar>
                  <!-- 头像 E -->
                </Col>
                <Col :xs="{span: 17, push: 0,pull:0}" :lg="{span: 17, push: 0,pull:0}">
                  <div style="display: flex; flex-direction: column;">
                    <Tooltip :content="$t('list.colums.playerId')">
                      <ExposedName>
                        <h2>
                          <router-link :to="{name: 'player', params: { ouid: `${d.originPersonaId}`, query: {byPath: $route.name} }}"
                                       :style="d.avatarLink == '' ? 'color: rgba(255,0,0,1);text-decoration: line-through;' : ''">
                            {{ d.originName }}
                          </router-link>
                        </h2>
                      </ExposedName>
                    </Tooltip>
                  </div>

                  <div>
                    {{ $t('list.colums.reportTime') }}
                    <TimeView :time="d.createTime">
                      <Time v-if="d.createTime" :time="d.createTime"/>
                    </TimeView>
                    <Divider type="vertical"/>
                    {{ $t('list.colums.updateTime') }}
                    <TimeView :time="d.updateTime">
                      <Time v-if="d.updateTime" :time="d.updateTime"/>
                    </TimeView>
                  </div>
                </Col>
                <Col :xs="{span: 24, push: 0,pull:0}" :lg="{span: 4, push: 0,pull:0}" class="mobile-hide">
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
              </Row>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
    <div v-if="list.length <= 0">{{ $t('basic.tip.notContent') }}</div>

    <br>
    <Row>
      <Col :xs="{span: 23, push: 1}" :lg="{span: 24, push: 0}">
        <Page class="page"
              size="small"
              show-sizer
              show-total
              show-elevator
              @on-change="handlePageChange"
              @on-page-size-change="handlePageSizeChange"
              :page-size="limit"
              :current="skip"
              :total="total"/>
      </Col>
    </Row>

  </div>
  <div class="profile-body" v-else>
    <p>Disable Component</p>
    <div><img src="@/assets/images/open-component.png" width="80%"/></div>
  </div>
</template>

<script>
import {api, http_token} from "@/assets/js";

import cheaterStatus from '/public/config/cheaterStatus.json'
import gameName from '/public/config/gameName.json'

import TimeView from "@/components/TimeView";
import ExposedName from "@/components/ExposedName";

export default {
  components: {ExposedName, TimeView},
  data() {
    return {
      gameName: "all",
      games: gameName.child,
      statusName: "-1",
      cheaterStatus: cheaterStatus.child,
      load: false,
      list: [],
      checkboxAll: false,

      total: 0,
      skip: 1,
      limit: 10,
    }
  },
  created() {
    this.http = http_token.call(this);

    this.getSubscribes();
  },
  methods: {
    /**
     * 取得订阅列表
     */
    getSubscribes() {
      const {skip, limit} = this;
      if (!this.$store.state.configuration.subscribes) return;

      this.load = true;
      this.http.post(api["user_subscribes"], {
        data: {
          skip: (skip || 1) - 1,
          limit: limit,
        }
      }).then(res => {
        const d = res.data;

        if (d.success == 1) {
          this.list = d.data;
          this.total = d.total;
        }
      }).finally(() => {
        this.load = false;
      });
    },
    /**
     * 批量多选
     */
    onCheckboxAll() {
      let array = this.list;
      for (let i = 0; i < array.length; i++) {
        this.list[i]['checkbox'] = this.checkboxAll
      }
    },
    /**
     * 删除
     */
    onDelete() {
      let array = this.list;
      let subscribesArray = array.filter(i => i["checkbox"]).map(i => i.id);

      if (subscribesArray.length > 0)
        this.http.post(api["user_subscribes_delete"], {
          data: {playerIds: subscribesArray}
        }).then(res => {
          const d = res.data;

          if (d.success == 1) {
            this.list = this.list.filter(i => !subscribesArray.includes(i.id));
          }
        });
    },
    handlePageSizeChange(num) {
      this.limit = num;
      this.getSubscribes();
    },
    handlePageChange(num) {
      this.skip = num;
      this.getSubscribes();
    }
  },
  computed: {}
}
</script>

<style lang="less" scoped>
@import "@/assets/css/radio.less";
@import "@/assets/css/icon.less";

.history-buttons {
  margin-top: 5px;
}

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
