<template>
  <div class="footer-box">
    <div class="footer-box-tip">
      <div class="ivu-card ivu-card-bordered ivu-card-dis-hover auto-player-list"
           :class="[
            isFooterFull ? 'full' : '',
            $store.state.configuration.autoUpdatePlayerList ? 'show' : ''
           ]">
        <Row>
          <Col flex="1">
            <Badge status="success" />
            <router-link :to="{name: 'player_list', params: { status: 0, game: 'all' }}">
              {{ $store.state.$desktop.autoUpdatePlayerList.total || 0 }}{{ $t('basic.status.0') }}
            </router-link>
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
        <div v-if="isFooterFull" class="content">
          <Card dis-hover :padding="2" v-for="(i, index) in $store.state.$desktop.autoUpdatePlayerList.result" :key="index">
            <Row type="flex" align="middle">
              <Col flex="1">
                <a href="javascript:void(0)" @click="openDetail(i)"><b>{{i.originName}}</b></a>
              </Col>
              <Col>
                <Tag>{{i.games.toString()}}</Tag>
              </Col>
            </Row>
          </Card>
        </div>
      </div>
    </div>
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
      bottom: -100px;
      padding: 10px 20px !important;
      border-radius: 60px;
      min-width: 200px;
      box-shadow: 0 2px 20px #0000000d;
      transition: all .25s;
      animation: footerShowAnimation 1s;
    }

    .show {
      bottom: 15px !important;
    }

    .full {
      transition: all .25s;
      border-radius: 5px !important;
      width: 300px;
      min-height: 100px;
      max-height: 200px;

      .content {
        margin-top: 10px;
        max-height: 150px;
        overflow: auto;
      }

      .content > * {
        margin-bottom: 5px;
        font-size: 12px;
      }
    }

    @keyframes footerShowAnimation {
      0% {
        bottom: -600px;
        transform: translateX(-50%) scale(1);
      }
      95% {
        transform: translateX(-50%) scale(1.5);
      }
      100% {
        bottom: 15px;
        transform: translateX(-50%) scale(1);
      }
    }
  }
}
</style>