<template>
  <div>
    <Row :gutter="20">
      <Col flex="auto" >
        <RadioGroup
            class="game-type"
            v-model="gameName"
            type="button">
          <Radio label="all" value="all">
            {{ $t('basic.games.all') }}
          </Radio>
          <Radio :label="i.value" :disabled="i.disabled" v-for="i in games" :key="i.value" aria-radio
                 :style="'background-image: url(' + require('/src/assets/' + i.bk_file + '/bf.jpg') + ');'"
                 :class="gameName == i.value ? 'gametype-select' : ''">
            <img height="35" :src="require('/src/assets/' + i.bk_file + '/logo.png')" v-if="i.logo_src"/>
            <span v-else>{{ i.full_name }}</span>
          </Radio>
        </RadioGroup>
      </Col>
    </Row>
    <Row :gutter="10" class="history-buttons" type="flex" justify="center">
      <Col flex="1">
        <Checkbox v-model="checkboxAll" :disabled="list.length <= 0" @on-change="onCheckboxAll"></Checkbox>
        <Divider type="vertical" />
        <Button @click="onDelete" :disabled="list.length <= 0" size="small">
          <Icon type="md-trash" />
        </Button>
      </Col>
      <Col>
        <Select size="small" v-model="statusName" style="width: 150px">
          <Option value="-1">
            {{ $t("basic.status.all") }}
          </Option>
          <Option v-for="status in cheaterStatus" :value="status.value" :key="status.value">
            {{ $t(`basic.status[${status.value}]`) }}{{ status[$i18n.locale] }}
          </Option>
        </Select>
        <Divider type="vertical" />
        <Button @click="onForcedUpdate" size="small" :loading="load">
          <Icon type="md-refresh" />
        </Button>
      </Col>
    </Row>

    <br>

    <div class="list">
      <div v-for="(i, i_index) in list" :key="i_index">
        <Divider v-if="i.time && i_index > 0" dashed></Divider>
        <div v-for="(d, d_index) in i.data"
             :key="d.originUserId"
             v-show="onScreening(i_index, d_index)"
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
      <div v-if="list.length <= 0" align="center">
        <br>
        {{ $t('basic.tip.notcontent') }}
        <br>
      </div>
    </div>

  </div>
</template>

<script>
import {http_token, storage, player_storage} from "../../assets/js";

import cheaterStatus from '/public/conf/cheaterStatus.json'
import gameName from '/public/conf/gameName.json'

export default {
  data() {
    return {
      gameName: "all",
      games: gameName.child,
      statusName: "-1",
      cheaterStatus: cheaterStatus.child,
      checkboxAll: false,
      load: false,
      list: [{ time: 0, data: [] }, { time: 0, data: [] }],
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
      this.list = [{ time: 0, data: [] }, { time: 0, data: [] }];

      if (loaclData.code >= 0) {
        for (const key in loaclData.data.value) {
          let _data = await player_storage.query(key);

          if (loaclData.data.value[key] >= new Date('2022 09-11').getTime()) {
            this.list[0].data.push(_data);
          } else {
            this.list[1].data.push(_data);
          }
        }
      }
    },
    /**
     * 强制更新
     */
    async onForcedUpdate () {
      this.load = true;
      await player_storage.onForcedUpdate();
      this.getHisory();
      this.load = false;
    },
    /**
     * 筛选
     */
    onScreening (i_1, i_2) {
      let _static = false;

      if ( this.gameName == 'all' || this.statusMethods == '-1' ) { _static = true; }
      if ( this.list[i_1].data[i_2].games.includes(this.gameName)  ) { _static = true; }
      if ( this.list[i_1].data[i_2].status == this.statusName ) { _static = true; }

      return _static;
    },
    /**
     * 批量多选
     */
    onCheckboxAll () {
      let array = this.list;
      for (let i = 0; i < array.length; i++) {
        this.list[i]['checkbox'] = this.checkboxAll
      }
    },
    /**
     * 删除
     */
    onDelete () {
      let array = this.list;
      let _storage = storage.get('viewed');

      if (_storage.data && Object.keys(_storage.data.value) <= 0) {
        _storage = { data: {value: {}} }
      }

      for (let i = 0; i < array.length; i++) {
        for (let j = 0; j < this.list[i].data.length; j++) {
          if (this.list[i].data[j]['checkbox']) {
            delete _storage.data.value[this.list[i].data[j].id]
          }
        }
      }

      if (Object.keys(_storage.data.value) > 0) {
        storage.set('viewed', _storage.data.value);
        this.getHisory();
      }
    }
  }
}
</script>

<style lang="less" scoped>
@import "./src/assets/css/radio.less";

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