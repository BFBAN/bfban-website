<template>
  <div class="container">
    <div class="content">
      <template>
        <br>
        <Row>
          <Col :xs="{push: 1}" :lg="{push: 0}">
            <Breadcrumb>
              <BreadcrumbItem :to="{name: 'home'}">{{ $t("header.index") }}</BreadcrumbItem>
              <BreadcrumbItem :to="{name: 'player'}">{{ $t("list.title") }}</BreadcrumbItem>
              <BreadcrumbItem :to="{name: 'cheater'}">{{ $t("detail.info.cheatersInfo") }}</BreadcrumbItem>
              <BreadcrumbItem>{{ $t('share.title') }}</BreadcrumbItem>
            </Breadcrumb>
          </Col>
        </Row>
        <br>
      </template>

      <Row :gutter="10">
        <Col flex="1">
          <Card :padding="20" dis-hover class="share">
            <template v-if="share.collapse == 1">
              <div style="min-height: 500px;width: 100%;display: flex;justify-content: center;align-items: center">
                <Icon type="md-share"/>&emsp;<a :href="share.webLink" target="_blank">{{ share.webLinkText }}</a>
              </div>
            </template>
            <template v-else-if="share.collapse == 2 || share.collapse == 3">
              <div v-html="share.iframeLink" style="height: 800px; width: 100%"></div>
              <template if="share.collapse == 3">
                <div class="shareImage">
                  <div id="setSharePicture"></div>
                </div>
              </template>
            </template>

            <template v-else>
              <div style="min-height: 500px;width: 100%;display: flex;justify-content: center;align-items: center">
                (✿◡‿◡) 🦖
              </div>
            </template>
            <Spin size="large" fix v-if="share.load"></Spin>
          </Card>
        </Col>
        <Col span="8">
          <Form label-position="top" :model="share" @on-visible-change="onGenerateSharePicture">
            <Row :gutter="30">
              <Col>
                <FormItem label="">
                  <RadioGroup v-model="share.languages" type="button" @on-change="upDataShare">
                    <Radio :label="i.name" v-for="(i, index) in share.languagesChild" :key="index">
                      {{ i.label }}
                    </Radio>
                  </RadioGroup>
                </FormItem>
              </Col>
            </Row>
            <Collapse v-model="share.collapse" accordion hide-arrow>
              <Panel name="1">
                {{ $t('share.link.name') }}
                <div slot="content">
                  <FormItem :label="$t('share.link.linkUrl')">
                    <Input v-model="share.webLink"/>
                  </FormItem>
                  <FormItem :label="$t('share.link.textLink')">
                    <Input v-model="share.webLinkText" @on-change="upDataShare"/>
                  </FormItem>
                  <FormItem :label="$t('share.link.webHtmlLink')">
                    <Input v-model="share.webLinkHtml" type="textarea" :autosize="{minRows: 4,maxRows: 8}"
                           placeholder=""></Input>
                  </FormItem>
                </div>
              </Panel>
              <Panel name="2">
                {{ $t('share.iframe.name') }}
                <div slot="content">
                  <FormItem :label="$t('share.iframe.theme')">
                    <RadioGroup v-model="share.theme" type="button" @on-change="upDataShare">
                      <Radio :label="i.name" v-for="(i, index) in share.themeChild" :key="index">{{i.name}}</Radio>
                    </RadioGroup>
                  </FormItem>
                  <FormItem :label="$t('share.iframe.size')">
                    <RadioGroup v-model="share.size" type="button" @on-change="upDataShare">
                      <Radio :label="i.id" v-for="(i, index) in share.sizeChild" :key="index">{{i.name}}</Radio>
                    </RadioGroup>
                  </FormItem>
                  <FormItem :label="$t('share.iframe.code')">
                    <Input v-model="share.iframeLink" type="textarea" :autosize="{minRows: 4,maxRows: 8}"
                           placeholder=""></Input>
                  </FormItem>
                </div>
              </Panel>
              <Panel name="3">
                {{ $t('share.image.name') }}
                <div slot="content">
                  <Alert show-icon>{{ $t('share.image.describe') }}</Alert>
                  <br/>
                  <Button long @click="onGenerateSharePicture" :disabled="share.statusSharePicture" :load="!share.statusSharePicture">
                    {{ $t('share.image.generate') }}
                  </Button>
                </div>
              </Panel>
            </Collapse>
          </Form>
        </Col>
      </Row>
    </div>
  </div>
</template>

<script>
import BFBAN from "/src/assets/js/bfban";
import theme from "/public/conf/themes.json";
import languages from "/public/conf/languages.json";

import {api, http, http_token, util} from '../assets/js/index'
import vueQr from 'vue-qr'
import html2canvas from 'html2canvas';

import Empty from '../components/Empty.vue'
import BusinessCard from "../components/businessCard.vue";
import SharePlayerCell from "../components/SharePlayerCell.vue";

import {formatTextarea, waitForAction} from "@/mixins/common";

export default new BFBAN({
  data() {
    return {
      getGameLabel: util.getGameLabel,
      privileges: [],
      isCheaterExist: true,
      cheater: {
        originId: '',
      },
      games: [],
      spinShow: true,
      updateUserInfospinShow: false,
      updateCheaterModal: false,
      share: {
        collapse: "1",
        statusSharePicture: false,
        show: true,
        load: false,
        themeChild: theme.child,
        theme: theme.default,
        languagesChild: languages.child,
        languages: languages.default,
        size: 2, // size id
        sizeChild: [{
          name: 'w:300 * h:450',
          id: 1,
          value: {
            w: 300,
            h: 450,
          }
        }, {
            name: 'w:auto * h:350',
            id: 2,
            value: {
              w: null,
              h: 350,
            }
          }],
        webLink: '',
        webLinkText: '',
        webLinkHtml: '',
        iframeLink: ''
      },
    }
  },
  components: {Empty, BusinessCard, SharePlayerCell, vueQr},
  watch: {
    '$route': 'loadData'
  },
  created() {
    this.http = http_token.call(this);

    this.loadData();
    this.upDataShare();
  },
  methods: {
    async loadData() {
      // set Token Http mode
      this.http = http_token.call(this);
    },
    /**
     * 更新玩家信息
     * update cheater
     * @param e
     * @returns {boolean}
     */
    updateCheaterInfo(e) {
      waitForAction.call(e.target, 60);

      if (!this.$store.state.user) {
        this.$Message.error(this.$i18n.t('detail.messages.signIn'));
        return false;
      }

      this.updateUserInfospinShow = true;

      this.http.post(api["player_update"], {
        data: Object.assign(this.getParamsIds())
      }).then((res) => {
        this.updateUserInfospinShow = false;

        const d = res.data;
        if (d.error === 0) {
          const {cheaterGameName: originId, originUserId, avatarLink} = d.data.origin;

          this.cheater.originId = originId;
          this.cheater.originUserId = originUserId;
          this.cheater.avatarLink = avatarLink;

          // this.origins.unshift(d.data.origin);

          this.$Message.success(this.$i18n.t('detail.messages.updateComplete'));
        } else {
          this.$Message.error(d.msg);
        }
      });
    },
    /**
     * 更新 / 设置分享内容
     */
    upDataShare() {
      const that = this;
      const url = window.location.origin + `/player/${that.$route.params.ouid}`;
      const share = this.share;
      const shareSize = share.sizeChild.filter(i => i.id == this.share.size)[0].value || {};

      let _webLink = `${url}?lang=${share.languages}`;

      this.share.load = true;
      this.share = Object.assign(this.share, {
        webLink: _webLink,
        webLinkText: `${that.$i18n.t('share.link.textLinkContent', { webname: 'BFBAN', url: _webLink })}`,
        webLinkHtml: `<a href="${url}?lang=${share.languages}" target="_blank">${ share.webLinkText }</a>`,
        iframeLink: `<iframe src="${window.location.href}/card?full=true&theme=${share.theme}&lang=${share.languages}" scrolling="auto" frameborder="0" seamless style="filter:chroma(color=#ffffff);${shareSize.w ? `width:${shareSize.w}px;` : 'width:100%;'} ${shareSize.h ? `height:${shareSize.h}px;` : 'height:100%;'}"><a href="${url}" target="_blank">${url}</a></iframe>`.trim().replaceAll(/\r\n/g, '')
      });
      setTimeout(() => this.share.load = false, 1000)
    },
    /**
     * 生成分享图片
     */
    onGenerateSharePicture() {
      const that = this;
      const dom = document.querySelector("#getSharePicture .ivu-col.ivu-col-span-xs-22.ivu-col-xs-pull-1.ivu-col-xs-push-1.ivu-col-span-lg-19.ivu-col-lg-push-2");

      if (this.share.statusSharePicture) return;

      this.share.statusSharePicture = true;

      // 删除原有照片
      if (document.querySelector(".shareImage canvas")) {
        document.querySelector(".shareImage canvas").remove();
      }

      setTimeout(function () {
        html2canvas(dom, {
          allowTaint: false,
          useCORS: true,
          logging: true,
          scale: .9,
          imageTimeout: 100000,
          ignoreElements : (element) => {
            if (element.className && element.className.toString().indexOf('html2canvas-ignore') >= 0) {
              return true;
            }
          },
        }).then(canvas => {
          document.querySelector("#setSharePicture").after(canvas);
          that.share.statusSharePicture = false;
        }).finally(() => {
          that.share.statusSharePicture = false;
        });
      }, 1000);
    },
  },
  computed: {

  }
})
</script>

<style lang="scss">

</style>
