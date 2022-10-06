<template>
  <div v-if="$store.state.configuration.subscribes">
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
        {{ list.length }} / 100
        <Divider type="vertical" />
        <Select size="small" v-model="statusName" :disabled="listCalcStatistics <= 0" style="width: 150px">
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
                      <h2>
                        <router-link :to="{name: 'player', params: { ouid: `${d.originPersonaId}` }}"
                                     :style="d.avatarLink == '' ? 'color: rgba(255,0,0,1);text-decoration: line-through;' : ''">
                          {{ d.originName }}
                        </router-link>
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

    <div v-if="list.length <= 0">{{ $t('basic.tip.notContent') }}</div>
  </div>
  <div v-else>
    Disable Component
  </div>
</template>

<script>
import {api, http_token, storage, player_storage} from "../../assets/js";

import cheaterStatus from '/public/conf/cheaterStatus.json'
import gameName from '/public/conf/gameName.json'

export default {
  data() {
    return {
      gameName: "all",
      games: gameName.child,
      statusName: "-1",
      cheaterStatus: cheaterStatus.child,
      load: false,
      list: [],
      checkboxAll: false,
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
    getSubscribes () {
      let loaclData = storage.get('user.subscribes');

      if (!this.$store.state.configuration.subscribes) return;

      if (loaclData.code >= 0) {
        loaclData.data.value.forEach(async i => {
          this.list.push(await player_storage.query(i))
        })
      }
    },
    /**
     * 强制更新
     */
    async onForcedUpdate () {
      this.load = true;
      await player_storage.onForcedUpdate();
      this.load = false;
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

      if (_storage.data && _storage.data.value) {
        _storage = { data: {value: []} }
      }

      for (let i = 0; i < array.length; i++) {
        if (this.list[i]['checkbox'] && _storage.code >= 0) {
          _storage.data.value.splice(
              _storage.data.value.indexOf(this.list[i].id),
              1
          )
        }
      }

      if (_storage.data.value)
        storage.set('viewed', _storage.data.value);
    }
  },
  computed: {
    listCalcStatistics () {
      let count = 0;
      this.list.forEach(i => i.data.forEach(j => count+=1));
      return count;
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