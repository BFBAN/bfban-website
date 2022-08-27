<template>
  <span>
    <span @click="share.show = true">
      <slot></slot>
    </span>
    <Modal :title="$t('share.title')" v-model="share.show" :fullscreen="false" :scrollable="true" width="80%">
      <template v-if="share.collapse == 1">
        <div style="min-height: 500px;width: 100%;display: flex;justify-content: center;align-items: center">
          <Icon type="md-share"/>&emsp;<a :href="share.webLink" target="_blank">{{ share.webLinkText }}</a>
        </div>
      </template>
      <template v-else-if="share.collapse == 2">
        <div v-html="share.iframeLink" style="height: 800px; width: 100%"></div>
      </template>
      <template v-else-if="share.collapse == 3">
        <Card class="shareImage">
          <div id="setSharePicture"></div>
        </Card>
      </template>
      <template v-else>
        <div style="min-height: 500px;width: 100%;display: flex;justify-content: center;align-items: center">
          (✿◡‿◡) 🦖
        </div>
      </template>
      <Spin size="large" fix v-if="share.load"></Spin>
    </Modal>

    <Modal v-model="share.show" draggable sticky scrollable
           :mask="false"
           :closable="false"
           :footer-hide="true"
           class-name="vertical-center-modal"
           width="360px">
      <div slot="header" size="20" align="center">
        <Icon type="md-move" ></Icon>
      </div>
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
    </Modal>
  </span>
</template>

<script>
import languages from "/public/conf/languages.json";
import theme from "/public/conf/themes.json";

import html2canvas from 'html2canvas';

export default {
  data() {
    return {
      share: {
        collapse: "1",
        statusSharePicture: false,
        show: false,
        load: false,
        themeChild: theme.child,
        theme: theme.default,
        languagesChild: languages.child,
        languages: languages.default,
        size: 1, // size id
        sizeChild: [{
          name: 'w:auto * h:auto',
          id: 1,
          value: {
            w: null,
            h: null,
          }
        }, {
          name: 'w:1000 * h:auto',
          id: 2,
          value: {
            w: 1000,
            h: null,
          }
        }, {
          name: 'w:300 * h:auto',
          id: 3,
          value: {
            w: 300,
            h: null,
          }
        }],
        webLink: '',
        webLinkText: '',
        webLinkHtml: '',
        iframeLink: ''
      },
    }
  },
  created() {
    this.upDataShare();
  },
  methods: {
    /**
     * 更新 / 设置分享内容
     */
    upDataShare() {
      const that = this;
      const url = window.location.origin + window.location.pathname;
      const share = this.share;
      const shareSize = share.sizeChild.filter(i => i.id == this.share.size)[0].value || {};

      let _webLink = `${url}?lang=${share.languages}`;

      this.share.load = true;
      this.share = Object.assign(this.share, {
        webLink: _webLink,
        webLinkText: `${that.$i18n.t('share.textLinkContent', { webname: 'BFBAN', url: _webLink })}`,
        webLinkHtml: `<a href="${url}?lang=${share.languages}" target="_blank">${ share.webLinkText }</a>`,
        iframeLink: `<iframe src="${window.location.href}?full=true&theme=${share.theme}&lang=${share.languages}"  scrolling="auto" frameborder="0" seamless style="filter:chroma(color=#ffffff);${shareSize.w ? `width:${shareSize.w}px;` : 'width:100%;'} ${shareSize.h ? `height:${shareSize.h}px;` : 'height:100%;'}"><a href="${url}" target="_blank">${url}</a></iframe>`.trim().replaceAll(/\r\n/g, '')
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
  }
}
</script>

<style lang="less">
.shareImage canvas {
  width: 100% !important;
  height: 100% !important;
}

.vertical-center-modal{
  .ivu-modal{

  }
}
</style>