<template>
  <div class="footer-box" v-if="$route.name != 'workflow' && !$route.query.full">
    <Row :gutter="10" class="footer-box-tip" v-if="$store.state.configuration.footerBar">
      <Col class="ivu-card ivu-card-bordered ivu-card-dis-hover auto-player-list"
           v-show="$route.name != 'profile'"
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
            </Col>
            <Col flex="1">
              <router-link :to="{name: 'player_list', query: { status: '0', game: 'all' }}" v-show="!isFooterFull">
                <Icon type="ios-loading" class="spin-icon-load"
                      v-if="$store.state.$desktop.workflow.autoUpdatePlayerLoading"></Icon>
                <span v-else>{{
                    $store.state.$desktop.workflow.autoUpdatePlayerList.total || 0
                  }}{{ $t('basic.status.0.text') }}</span>
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
            <WorkflowView @on-close="onClose"></WorkflowView>
          </div>
        </div>
      </Col>
    </Row>
  </div>
</template>

<script>
import WorkflowView from "@/components/workflow/index.vue"

export default {
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
  }
}
</script>

<style lang="less" scoped>
@import "@/assets/css/icon";

.footer-box {
  &-tip {
    position: fixed;
    z-index: 900;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);

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
