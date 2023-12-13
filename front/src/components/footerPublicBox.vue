<template>
  <div class="footer-box">
    <Row :gutter="10" class="footer-box-tip" v-if="$store.state.configuration.footerBar">
      <Col class="ivu-card ivu-card-bordered ivu-card-dis-hover auto-player-list"
           v-show="$route.name != 'profile'"
           :class="[
            isFooterFull ? 'full' : '',
            $store.state.configuration.autoUpdatePlayerList ? 'show' : '',
            $store.state.configuration.desktopNotifiction ? '' : 'ivu-alert-warning'
           ]">
        <div>
          <Row :gutter="10" type="flex" align="middle" class="title">
            <Col flex="1">
              <Badge status="success" />
              <router-link :to="{name: 'player_list', query: { status: '0', game: 'all' }}" v-show="!isFooterFull">
                {{ $store.state.$desktop.autoUpdatePlayerList.total || 0 }}{{ $t('basic.status.0.text') }}
              </router-link>
            </Col>
            <Col v-if="!$store.state.configuration.desktopNotifiction">
              <Icon type="md-alert" />
              <Icon type="md-notifications-off" />
              <Divider type="vertical"></Divider>
            </Col>
            <Col>
              <a @click="isFooterFull = true" v-if="!isFooterFull">
                <Icon type="md-expand" />
              </a>
              <a @click="isFooterFull = false" v-else>
                <Icon type="md-contract" />
              </a>
            </Col>
          </Row>
          <div v-if="isFooterFull">
            <Tabs size="small">
              <TabPane :label="$t('basic.status.0.text')" class="content">
                <Card dis-hover :padding="2" v-for="(i, index) in $store.state.$desktop.autoUpdatePlayerList.result" :key="index">
                  <Row :gutter="4" type="flex" align="middle">
                    <Col>
                      <Avatar :src="i.avatarLink" size="15"></Avatar>
                    </Col>
                    <Col flex="1">
                      <a href="javascript:void(0)" @click="openDetail(i)"><b class="text-distinguishing-letter"><code>{{i.originName}}</code></b></a>
                    </Col>
                    <Col>
                      <Tag type="border">{{ $t('basic.games.' + i.games) }}</Tag>
                    </Col>
                  </Row>
                </Card>
              </TabPane>
            </Tabs>
          </div>
        </div>
      </Col>
    </Row>
  </div>
</template>

<script>
export default {
  name: "footerBox",
  data () {
    return {
      isFooterFull: false
    }
  },
  watch: {

  },
  methods: {
    openDetail (i) {
      this.isFooterFull = false;
      this.$router.push({ name: 'player', params: {ouid: i.originPersonaId} })
    }
  }
}
</script>

<style lang="less" scoped>
.footer-box {
  &-tip {
    position: fixed;
    z-index: 900;
    bottom: 0px;
    left: 50%;
    transform: translateX(-50%);

    .auto-player-list {
      backdrop-filter: blur(25px);
      bottom: -100px;
      opacity: 0;
      border-radius: 30px;
      min-width: 200px;
      box-shadow: 0 2px 20px #0000000d;
      animation: footerShowAnimation 1s;
      transition: all .25s;

      .title {
        padding: 10px 20px !important;
      }
    }

    @media screen and (max-width: 1024px) {
      .auto-player-list {
        min-width: 250px;
      }
    }

    .auto-player-list.show {
      opacity: 1;
      bottom: 15px !important;
    }

    .auto-player-list.full {
      transition: all .25s;
      border-radius: 5px !important;
      width: 400px;

      .content {
        padding: 10px;
        margin-top: -15px;
        min-height: 200px;
        max-height: 388px;
        overflow: auto;
      }

      .content > * {
        padding: 0 5px;
        margin-bottom: 5px;
        font-size: 12px;
      }
    }

    @keyframes footerShowAnimation {
      0% {
        bottom: -600px;
        transform: scale(1);
      }
      95% {
        transform: scale(1.1);
      }
      100% {
        bottom: 15px;
        transform: scale(1);
      }
    }
  }
}
</style>
