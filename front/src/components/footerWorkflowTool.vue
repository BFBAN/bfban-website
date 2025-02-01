<template>
  <div class="footer-box" v-if="isShow">
    <Row :gutter="10" class="footer-box-tip mobile-hide" v-if="$store.state.configuration.footerBar">
      <Col class="ivu-card ivu-card-bordered ivu-card-dis-hover auto-player-list"
           v-show="$route.name !== 'profile'"
           :class="[
            isFooterFull ? 'full' : '',
            $store.state.configuration.autoUpdatePlayerList ? 'show' : '',
            $store.state.configuration.desktopNotification ? '' : 'ivu-alert-warning'
           ]">
        <div>
          <Row :gutter="30" type="flex" align="middle" class="workflow-header">
            <Col>
              <router-link :to="{name: 'workflow'}">
                <b class="workflow-title">{{ $t('workflow.title') }}</b>
              </router-link>
              <Icon type="md-open" v-if="$route.name !== 'workflow' && isFooterFull"></Icon>
            </Col>
            <Col flex="1">
              <router-link :to="{name: 'player_list', query: { status: '0', game: 'all' }}" v-show="!isFooterFull">
                <Icon type="ios-loading" class="spin-icon-load"
                      v-if="$store.state.$desktop.workflow.autoUpdatePlayerLoading"></Icon>
                <span v-else>
                  <template v-if="$store.state.$desktop.workflow.autoUpdatePlayerList">
                    {{ $store.state.$desktop.workflow.autoUpdatePlayerList.total || 0 }}
                  </template>
                  {{ $t('basic.status.0.text') }}
                </span>
              </router-link>
            </Col>
            <Col v-if="!$store.state.configuration.desktopNotification">
              <Icon type="md-alert"/>
              <Icon type="md-notifications-off"/>
              <Divider type="vertical"></Divider>
            </Col>
            <Col>
              <a @click="isFooterFull = true" v-if="!isFooterFull">
                <Icon type="md-expand"/>
              </a>
              <a @click="isFooterFull = false" v-else>
                <Icon type="md-contract"/>
              </a>
            </Col>
          </Row>
          <div v-show="isFooterFull" class="footer-workflow container">
            <keep-alive>
              <WorkflowView @close="() => onClose()"></WorkflowView>
            </keep-alive>
          </div>
        </div>
      </Col>
    </Row>
  </div>
</template>

<script>
import WorkflowView from "@/components/workflow/index.vue"
import Application from "@/assets/js/application";

export default new Application( {
  name: "footerBox",
  data() {
    return {
      isFooterFull: false
    }
  },
  watch: {},
  components: {WorkflowView},
  methods: {
    onClose() {
      this.isFooterFull = false;
    }
  },
  computed: {
    isShow () {
      return this.$route.name !== 'workflow' && !this.$route.query.full && !this.isMobile;
    }
  }
})
</script>

<style lang="less" scoped>
@import "@/assets/css/icon";

@media only screen and (max-width: 480px) {
  .footer-box-tip {
    left: 0 !important;
  }
}

.footer-box {
  position: fixed;
  z-index: 1000;
  left: 0;
  right: 0;
  bottom: 0;

  &-tip {
    pointer-events: auto;
    position: absolute;
    z-index: 1001;
    bottom: 0;
    left: calc(50% - 602px);

    .footer-workflow {
      max-height: 70vh;
      overflow: auto;
    }

    .workflow-header {
      padding: 8px 10px;
    }

    .workflow-title {
      margin: 10px 0;
      font-weight: bold;
      font-size: 15px;
    }

    .auto-player-list.show {
      opacity: 1;
      bottom: 15px !important;
    }

    .auto-player-list.full {
      transition: all .25s;
      border-radius: 5px !important;
    }
  }
}
</style>
