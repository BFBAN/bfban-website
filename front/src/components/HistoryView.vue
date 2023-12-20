<script setup>
import {api, http_token, storage} from "@/assets/js";
import Empty from "@/components/Empty.vue";

export default {
  data() {
    return {
      load: false,
      list: [],

      total: 0,
      skip: 1,
      limit: 10
    }
  },
  components: {Empty},
  watch: {
    '$route': 'getHistory',
  },
  created() {
    this.http = http_token.call(this);

    this.getHistory()
  },
  methods: {
    /**
     * 取得历史列表
     */
    async getHistory() {
      const {skip, limit} = this;
      let localData = storage.get('viewed');
      this.list = [];

      if (localData.code != 0 && !localData.data?.value) return;
      if (!this.$store.state.configuration.history) return;

      let dbIds = Object.entries(localData.data.value)
          .sort((a, b) => a[1] > b[1] ? 1 : -1)
          .slice((skip - 1) * limit, skip * limit)
          .map(i => i[0]);

      this.load = true;
      this.http.get(api["player_batch"], {
        params: {dbIds}
      }).then(res => {
        const d = res.data;

        if (d.success == 1) {
          this.list = d.data
              .map(i => localData.data.value[i.id] ? {...i, historyCreationTime: localData.data.value[i.id]} : i)
              .sort((a, b) => b.historyCreationTime - a.historyCreationTime);
        }
      }).finally(() => {
        this.load = false;
      });

      this.total = Object.entries(localData.data.value).length;
    },
  }
}
</script>

<template>
  <Poptip trigger="click" width="300">
    <Tooltip :content="$t('profile.history.title')" placement="bottom-end">
      <slot></slot>
    </Tooltip>
    <div slot="content">
      <Row>
        <Col flex="1">{{ $t('profile.history.title') }}</Col>
        <Col>
          <Button @click="getHistory" size="small" :disabled="load">
            <Icon type="md-refresh" size="15" :class="[
                load ? 'spin-icon-load' : ''
            ]"/>
          </Button>
        </Col>
      </Row>
      <div class="history-view">
        <template v-if="list.length > 0">
          <div v-for="(d, d_index) in list" :key="d_index" class="history-view-item">
            <Row :gutter="10" type="flex" justify="center" align="middle">
              <Col flex="1">
                <Row :gutter="20" type="flex" align="middle">
                  <Col :xs="{span: 8, push: 0,pull:0}" :lg="{span: 3, push: 0,pull:0}">
                    <!-- 头像 S -->
                    <Avatar :src="d.avatarLink"
                            alt="avatar"
                            size="25"
                            v-if="d.avatarLink">
                    </Avatar>
                    <!-- 头像 E -->
                  </Col>
                  <Col :xs="{span: 17, push: 0,pull:0}" :lg="{span: 17, push: 0,pull:0}">
                    <div style="display: flex; flex-direction: column;">
                      <Tooltip :content="$t('list.colums.playerId')">
                        <b class="text-distinguishing-letter">
                          <router-link :to="{name: 'player', params: { ouid: `${d.originPersonaId}` }}"
                                       :style="d.avatarLink == '' ? 'color: rgba(255,0,0,1);text-decoration: line-through;' : ''">
                            <code>{{ d.originName }}</code>
                          </router-link>
                        </b>
                      </Tooltip>
                    </div>
                  </Col>
                </Row>
              </Col>
              <Col>
                <Time :time="d.historyCreationTime" type="relative"></Time>
              </Col>
            </Row>
          </div>
        </template>
        <Spin size="large" fix v-else-if="list.length <= 0 && load" v-show="true">
          <Icon type="ios-loading" size="30" class="spin-icon-load"></Icon>
        </Spin>
        <Empty :notHint="false" v-else></Empty>
      </div>

      <Button long :to="{path:'/profile/history'}">{{ $t('home.activity.more') }}</Button>
    </div>
  </Poptip>
</template>

<style scoped lang="less">
@import "@/assets/css/icon.less";

.history-view {
  position: relative;
  margin: 10px 0;

  .history-view-item {
    margin-bottom: 6px;
  }
}
</style>
