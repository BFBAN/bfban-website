<template>
  <div class="container">
    <div class="content">
      <template>
        <br>
        <Row>
          <Col :xs="{push: 1}" :lg="{push: 0}">
            <Breadcrumb>
              <BreadcrumbItem :to="{name: 'home'}">{{ $t("header.index") }}</BreadcrumbItem>
              <BreadcrumbItem :to="{name: 'player_list'}">{{ $t("list.title") }}</BreadcrumbItem>
              <BreadcrumbItem :to="{name: 'player'}">{{ $t("detail.info.cheatersInfo") }}</BreadcrumbItem>
              <BreadcrumbItem>{{ $t('share.title') }}</BreadcrumbItem>
            </Breadcrumb>
          </Col>
        </Row>
        <br>
      </template>

      <Modal v-model="share.modeShow" footer-hide width="960">
        <div class="shareImage" style="text-align: center">
          <div id="setSharePicture"></div>
        </div>
      </Modal>

      <Row :gutter="10">
        <Col flex="1">
          <Card :padding="20" dis-hover class="share">
            <template v-if="share.collapse == 1">
              <div style="min-height: 500px;width: 100%;display: flex;justify-content: center;align-items: center">
                <a :href="share.webLink" v-t="{
                  path: 'share.link.textLinkContent',
                  args: { webname: share.appName, url: share.webLink },
                  locale: share.languages
                }" target="_blank"></a>
              </div>
            </template>
            <template v-else-if="share.collapse == 2">
              <div v-html="share.iframeLink" style="height: 800px; width: 100%"></div>
            </template>
            <template v-else-if="share.collapse == 3">
              <div style="position: relative; overflow: hidden">
                <SharePlayerCell ref="sharePlayerWidget" id="getSharePicture_window" :personaId="$route.params.ouid"
                                 :lang="share.languages"></SharePlayerCell>
              </div>
            </template>
            <template v-else>
              <div style="min-height: 500px;width: 100%;display: flex;justify-content: center;align-items: center">
                (✿◡‿◡) 🦖
              </div>
            </template>
            <Spin size="large" fix v-if="share.load"></Spin>
          </Card>
        </Col>
        <Col class="desktop-hide" span="24"><br></Col>
        <Col span="8" :xs="{span: 24}" :lg="{span: 8}">
          <Form label-position="top" :model="share" @on-visible-change="onGenerateSharePicture">
            <FormItem :title="$t('footer.languages')">
              <Select v-model="share.languages" @on-change="upDataShare" size="large">
                <Option :value="i.name" v-for="(i, index) in share.languagesChild" :key="index" v-show="!i.ignoreSave">
                  {{ i.label }}
                </Option>
              </Select>
            </FormItem>
            <Collapse v-model="share.collapse" accordion hide-arrow>
              <Panel name="1">
                {{ $t('share.link.name') }}
                <div slot="content">
                  <FormItem :label="$t('share.link.linkUrl')">
                    <Input v-model="share.webLink" readonly/>
                  </FormItem>
                  <FormItem :label="$t('share.link.textLink')">
                    <Input :value="share.webLinkText" readonly/>
                  </FormItem>
                  <FormItem :label="$t('share.link.webHtmlLink')">
                    <Input v-model="share.webLinkHtml" type="textarea" :autosize="{minRows: 4,maxRows: 8}"
                           placeholder="" readonly></Input>
                  </FormItem>
                </div>
              </Panel>
              <Panel name="2">
                {{ $t('share.iframe.name') }}
                <div slot="content">
                  <FormItem :label="$t('share.iframe.theme')">
                    <RadioGroup v-model="share.theme" type="button" @on-change="upDataShare">
                      <Radio :label="i.name" v-for="(i, index) in share.themeChild" :key="index">{{ i.name }}</Radio>
                    </RadioGroup>
                  </FormItem>
                  <FormItem :label="$t('share.iframe.size')">
                    <RadioGroup v-model="share.size" type="button" @on-change="upDataShare">
                      <Radio :label="i.id" v-for="(i, index) in share.sizeChild" :key="index">{{ i.name }}</Radio>
                    </RadioGroup>
                  </FormItem>
                  <FormItem :label="$t('share.iframe.code')">
                    <Input v-model="share.iframeLink" type="textarea"
                           :autosize="{minRows: 8}"
                           :placeholder="$t('share.iframe.code')"
                           readonly></Input>
                  </FormItem>
                </div>
              </Panel>
              <Panel name="3">
                {{ $t('share.image.name') }}
                <div slot="content">
                  <Alert show-icon>{{ $t('share.image.describe') }}</Alert>
                  <br/>
                  <FormItem>
                    <Select v-model="share.fileValue">
                      <Option v-for="(i, index) in share.fileType" :key="index" :value="i.format" :label="i.name">
                        {{ i.name }}
                      </Option>
                    </Select>
                  </FormItem>
                  <FormItem>
                    <Button long @click="onGenerateSharePicture" :disabled="share.statusSharePicture"
                            :loading="share.statusSharePicture">
                      {{ $t('share.image.generate') }}
                    </Button>
                  </FormItem>
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
import Application from "/src/assets/js/application";
import theme from "/public/conf/themes.json";
import languages from "/public/conf/languages.json";
import config from "@/../package.json";

import {http_token} from '../assets/js/index'
import vueQr from 'vue-qr'
import html2canvas from 'html2canvas';

import Empty from '../components/Empty.vue'
import BusinessCard from "../components/businessCard.vue";
import SharePlayerCell from "../components/SharePlayerCell.vue";

export default new Application({
  data() {
    return {
      share: {
        appName: "app",
        modeShow: false,
        collapse: "1",
        statusSharePicture: false,
        show: true,
        load: false,
        themeChild: theme.child,
        theme: theme.default,
        languagesChild: languages.child,
        languages: languages.default,
        size: 3, // size id
        sizeChild: [{
          name: 'w:300 * h:450',
          id: 1,
          value: {
            w: 300,
            h: 450,
          }
        }, {
          name: 'w:349 * h:280',
          id: 2,
          value: {
            w: 349,
            h: 280,
          }
        }, {
          name: 'w:auto * h:350',
          id: 3,
          value: {
            w: null,
            h: 350,
          }
        }],
        webLink: '',
        webLinkText: '',
        webLinkHtml: '',
        iframeLink: '',
        fileValue: 'jpg',
        fileType: [{name: 'image/jpg', format: 'jpg'}, {name: 'image/png', format: 'png'}]
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

      this.share.appName = config.name;
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
      const _shareWebLinkText = `${that.$i18n.tc('share.link.textLinkContent', 0, this.share.languages, {
        'webname': this.share.appName,
        'url': _webLink,
      })}`;
      this.share.webLink = _webLink;

      if (this.$refs.sharePlayerWidget) {
        this.$refs.sharePlayerWidget.onLoadLang(share.languages);
      }

      this.share.load = true;
      this.share = Object.assign(this.share, {
        webLink: _webLink,
        webLinkText: _shareWebLinkText,
        webLinkHtml: `<a href="${url}?lang=${share.languages}" target="_blank">${_shareWebLinkText}</a>`,
        iframeLink: `<iframe src="${window.location.href}/card?full=true&theme=${share.theme}&lang=${share.languages}" scrolling="auto" frameborder="0" seamless style="filter:chroma(color=#ffffff);${shareSize.w ? `width:${shareSize.w}px;` : 'width:100%;'} ${shareSize.h ? `height:${shareSize.h}px;` : 'height:100%;'}"><a href="${url}" target="_blank">${url}</a></iframe>`.trim().replaceAll(/\r\n/g, '')
      });
      setTimeout(() => this.share.load = false, 1000)
    },
    /**
     * 生成分享图片
     */
    onGenerateSharePicture() {
      const that = this;
      const dom = document.querySelector("#getSharePicture_window");

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
          scale: 1,
          imageTimeout: 100000,
          ignoreElements: (element) => {
            if (element.className && element.className.toString().indexOf('html2canvas-ignore') >= 0) {
              return true;
            }
          },
        }).then(canvas => {
          document.querySelector("#setSharePicture").after(canvas);

          that.share.statusSharePicture = false;
          that.share.modeShow = true;

          that.onDownload(canvas);
        }).catch(err => {
          console.log(err)
        }).finally(() => {
          that.share.statusSharePicture = false;
        });
      }, 1000);
    },
    /**
     * 生成下载
     * @param canvas
     */
    onDownload(canvas) {
      let link = document.createElement("a");
      let imgData = canvas.toDataURL({
        format: this.share.fileValue,
        quality: 1
      });

      link.download = `${this.share.appName}_${new Date().getTime()}.jpg`;
      link.href = URL.createObjectURL(this.dataURLtoBlob(imgData));
      link.click();
    },
    /**
     * dataUrl 转 blob
     * @param data_url
     * @returns {Blob}
     */
    dataURLtoBlob(data_url) {
      let arr = data_url.split(','),
          mime = arr[0].match(/:(.*?);/)[1],
          atobStr = atob(arr[1]),
          n = atobStr.length,
          u8arr = new Uint8Array(n);

      while (n--) {
        u8arr[n] = atobStr.charCodeAt(n);
      }
      return new Blob([u8arr], {type: mime});
    },
  }
})
</script>

<style lang="scss" scoped>

</style>
