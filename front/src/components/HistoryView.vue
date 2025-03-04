<script>
import {api, application, http_token, storage} from "@/assets/js";
import Empty from "@/components/Empty.vue";
import ExposedName from "@/components/ExposedName.vue";

export default new application({
  data() {
    return {
      load: false,
      list: [],

      total: 0,
      skip: 1,
      limit: 10
    }
  },
  components: {ExposedName, Empty},
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
      if (!this.isLogin) return;

      const {skip, limit} = this;
      let localData = storage.local.get('viewed');
      this.list = [];

      if (localData.code !== 0 && !localData.data?.value) return;
      if (this.load && !this.$store.state.configuration.history) return;

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
  }
})
</script>

<template>
  <Poptip trigger="click" width="300" transfer @on-popper-show="getHistory">
    <Tooltip :content="$t('profile.history.title')" placement="bottom-end">
      <slot></slot>
    </Tooltip>
    <div slot="content" class="history-view">
      <Row class="history-header">
        <Col flex="1"><b>{{ $t('profile.history.title') }}</b></Col>
        <Col>
          <Button @click="getHistory" size="small" :disabled="load">
            <Icon type="md-refresh" size="15" :class="[
                load ? 'spin-icon-load' : ''
            ]"/>
          </Button>
        </Col>
      </Row>
      <div class="history-view-list">
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
                    <ExposedName disabled="">
                      <b>
                        <router-link
                            :to="{name: 'player', params: { ouid: d.originPersonaId }, query: {byPath: $route.name}}"
                            :style="d.avatarLink === '' ? 'color: rgba(255,0,0,1);text-decoration: line-through;' : ''">
                          {{ d.originName }}
                        </router-link>
                      </b>
                    </ExposedName>
                  </Col>
                </Row>
              </Col>
              <Col v-if="d.historyCreationTime">
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

      <Spin fix v-show="!isLogin">
        <div>
          <Icon type="md-lock" size="50"/>
        </div>
        <br>
        <Button :to="{name: 'signin'}">{{ $t("header.signin") }}</Button>
      </Spin>
    </div>
  </Poptip>
</template>

<style scoped lang="less">
@import "@/assets/css/icon.less";

.history-view {
  position: relative;

  .history-header {
    margin-bottom: 10px;
  }

  .history-view-list {
    min-height: 150px;
  }

  .history-view-item {
    margin-bottom: 6px;
  }
}
</style>
