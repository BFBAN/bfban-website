<template>
  <div class="profile-body">
    <template v-if="$store.state.configuration.history">
      <Row :gutter="10" class="history-buttons" type="flex" justify="center">
        <Col flex="1">
          <Checkbox v-model="checkboxAll" @on-change="onCheckboxAll"></Checkbox>
          <Divider type="vertical"/>
          <Button @click="onDelete" size="small">
            <Icon type="md-trash"/>
          </Button>
        </Col>
        <Col>
          <Button @click="getHisory" size="small">
            <Icon type="md-refresh" :class="[load ? 'spin-icon-load' :'']"/>
          </Button>
        </Col>
      </Row>

      <br>

      <div class="list">
        <template v-if="list.length > 0">
          <div v-for="(d, d_index) in list" :key="d_index"
               class="item-card">
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
                              <router-link :to="{name: 'player', params: { ouid: `${d.originPersonaId}` }}"
                                           :style="d.avatarLink == '' ? 'color: rgba(255,0,0,1);text-decoration: line-through;' : ''">
                                <code>{{ d.originName }}</code>
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
                        <Divider type="vertical"/>
                        <TimeView :time="d.historyCreationTime">
                          <Time v-if="d.historyCreationTime" :time="d.historyCreationTime"/>
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
        </template>
        <Empty v-else></Empty>
      </div>

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
    </template>
    <div v-else>
      <p>Disable Component</p>
      <div><img src="@/assets/images/open-component.png" width="80%"/></div>
    </div>
  </div>
</template>

<script>
import {api, http_token, storage} from "../../assets/js";

import cheaterStatus from '/public/config/cheaterStatus.json'
import gameName from '/public/config/gameName.json'
import Empty from "@/components/Empty.vue";
import TimeView from "@/components/TimeView.vue";
import ExposedName from "@/components/ExposedName.vue";

export default {
  components: {ExposedName, TimeView, Empty},
  data() {
    return {
      disable: false,
      gameName: "all",
      games: gameName.child,
      statusName: "-1",
      cheaterStatus: cheaterStatus.child,
      checkboxAll: false,
      load: false,
      list: [],

      total: 0,
      skip: 1,
      limit: 10
    }
  },
  created() {
    this.http = http_token.call(this);

    this.getHisory()
  },
  methods: {
    /**
     * 取得历史列表
     */
    async getHisory() {
      const {skip, limit} = this;
      let localData = storage.local.get('viewed');
      this.list = [];

      if (localData.code !== 0 && !localData.data.value) return;
      if (!this.$store.state.configuration.history) return;

      let dbIds = Object.entries(localData.data.value)
          .sort((a, b) => a[1] > b[1] ? 1 : -1)
          .slice((skip - 1) * limit, skip * limit)
          .map(i => i[0]);

      this.load = true;
      this.http.get(api["player_batchs"], {
        params: {dbIds}
      }).then(res => {
        const d = res.data;

        if (d.success === 1) {
          this.list = d.data
              .map(i => localData.data.value[i.id] ? {...i, historyCreationTime: localData.data.value[i.id]} : i)
              .sort((a, b) => b.historyCreationTime - a.historyCreationTime);
        }
      }).finally(() => {
        this.load = false;
      });

      this.total = Object.entries(localData.data.value).length;
    },
    /**
     * 筛选
     */
    onScreening(i_1, i_2) {
      let _static = false;

      if (this.gameName == 'all' || this.statusMethods == '-1') {
        _static = true;
      }
      if (this.list[i_1].data[i_2].games && this.list[i_1].data[i_2].games.includes(this.gameName)) {
        _static = true;
      }
      if (this.list[i_1].data[i_2].status == this.statusName) {
        _static = true;
      }

      return _static;
    },
    /**
     * 批量多选
     */
    onCheckboxAll() {
      let array = this.list;
      for (let i = 0; i < array.length; i++) {
        array[i]["checkbox"] = this.checkboxAll;
      }
    },
    /**
     * 删除
     */
    onDelete() {
      let array = this.list;
      let _storage = storage.local.get('viewed');

      if (_storage.code != 0 && _storage.data && Object.keys(_storage.data.value) <= 0) {
        _storage = {data: {value: {}}}
      }

      // 查询删除
      for (let i = 0; i < array.length; i++) {
        if (array[i]["checkbox"]) {
          delete _storage.data.value[array[i]["id"]];
        }
      }

      if (Object.keys(_storage.data.value).length >= 0) {
        storage.local.set('viewed', _storage.data.value);
        this.getHisory();
      }
    },
    handlePageSizeChange(num) {
      this.limit = num;
      this.getHisory();
    },
    handlePageChange(num) {
      this.skip = num;
      console.log("page", num);
      this.getHisory();
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
