<template>
  <span>
    <span @click="share.show = true">
      <slot></slot>
    </span>
    <Modal title="share Link" v-model="share.show" fullscreen>
      <Row :gutter="30">
        <Col flex="1" style="height: 100%;" class="content">
            <template v-if="share.collapse == 1">
              <div style="min-height: 500px;width: 100%;display: flex;justify-content: center;align-items: center">
                <Icon type="md-share"/>&emsp;<a :href="share.webLink" target="_blank">{{ share.webLinkText }}</a>
              </div>
            </template>
            <template v-else-if="share.collapse == 2">
              <div v-html="share.iframeLink" style="height: 800px; width: 100%" id="getSharePicture"></div>
            </template>
            <template v-else-if="share.collapse == 3">
              <div id="setSharePicture"></div>
            </template>
            <template v-else>
              <div style="min-height: 500px;width: 100%;display: flex;justify-content: center;align-items: center">
                (✿◡‿◡) 🦖
              </div>
            </template>
            <Spin size="large" fix v-if="share.load"></Spin>
        </Col>
        <Col flex="400px">
          <Form label-position="top" :model="share" @on-visible-change="onGenerateSharePicture">
            <Card>
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
<!--              <Collapse v-model="share.collapse" accordion simple>-->
<!--                <Panel name="1">-->
<!--                    web link-->
<!--                    <FormItem label="web link" slot="content">-->
<!--                      <Input v-model="share.webLink"/>-->
<!--                    </FormItem>-->
<!--                    <FormItem label="web link text" slot="content">-->
<!--                      <Input v-model="share.webLinkText" @on-change="upDataShare"/>-->
<!--                    </FormItem>-->
<!--                    <FormItem slot="content" label="web link code">-->
<!--                      <Input v-model="share.webLinkHtml" type="textarea" :autosize="{minRows: 4,maxRows: 8}"-->
<!--                             placeholder=""></Input>-->
<!--                    </FormItem>-->
<!--                </Panel>-->
<!--                <Panel name="2">-->
<!--                    iframe-->
<!--                    <Row slot="content" :gutter="30">-->
<!--                      <Col>-->
<!--                        <FormItem label="">-->
<!--                          <RadioGroup v-model="share.theme" type="button" @on-change="upDataShare">-->
<!--                            <Radio :label="i.name" v-for="(i, index) in share.themeChild" :key="index">{{-->
<!--                                i.name-->
<!--                              }}</Radio>-->
<!--                          </RadioGroup>-->
<!--                        </FormItem>-->
<!--                      </Col>-->
<!--                      <Col>-->
<!--                        <FormItem label="">-->
<!--                          <RadioGroup v-model="share.size" type="button" @on-change="upDataShare">-->
<!--                            <Radio :label="i.value" v-for="(i, index) in share.sizeChild" :key="index">{{-->
<!--                                i.name-->
<!--                              }}-->
<!--                            </Radio>-->
<!--                          </RadioGroup>-->
<!--                        </FormItem>-->
<!--                      </Col>-->
<!--                    </Row>-->
<!--                    <FormItem slot="content" label="iframe code">-->
<!--                      <Input v-model="share.iframeLink" type="textarea" :autosize="{minRows: 4,maxRows: 8}"-->
<!--                             placeholder=""></Input>-->
<!--                    </FormItem>-->
<!--                </Panel>-->
<!--            </Collapse>-->
            </Card>
          </Form>
        </Col>
      </Row>
    </Modal>
  </span>
</template>

<script>
import languages from "/public/conf/languages.json";
import theme from "/public/conf/themes.json";

// import html2canvas from 'html2canvas';

export default {
  data() {
    return {
      share: {
        collapse: 1,
        statusSharePicture: false,
        show: false,
        load: false,
        themeChild: theme.child,
        theme: theme.default,
        languagesChild: languages.child,
        languages: languages.default,
        size: {w: null, h: null},
        sizeChild: [{
          name: 'w:auto * h:auto',
          value: {
            w: null,
            h: null,
          }
        }, {
          name: 'w:1000 * h:auto',
          value: {
            w: 1000,
            h: null,
          }
        }, {
          name: 'w:300 * h:auto',
          value: {
            w: 300,
            h: null,
          }
        }],
        webLink: '',
        webLinkText: 'bfban.com',
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
      const url = window.location.origin + window.location.pathname;
      const share = this.share;
      this.share.load = true;
      this.share = Object.assign(this.share, {
        webLink: `${url}?lang=${share.languages}`,
        webLinkHtml: `<a href="${url}?lang=${share.languages}" target="_blank">${ share.webLinkText }</a>`,
        iframeLink: `<iframe src="${window.location.href}?full=true&theme=${share.theme}&lang=${share.languages}"  scrolling="auto" frameborder="0" seamless style="filter:chroma(color=#ffffff);${share.size.w ? `width:${share.size.w}px;` : 'width:100%;'} ${share.size.h ? `height:${share.size.h}px;` : 'height:100%;'}"><a href="${url}" target="_blank">${url}</a></iframe>`.trim().replaceAll(/\r\n/g, '')
      });
      setTimeout(() => this.share.load = false, 1000)
    },

    /**
     * 生成分享图片
     */
    onGenerateSharePicture(status) {
      // const that = this;
      // if (!status || this.share.statusSharePicture) return;
      // this.share.load = true;
      // setTimeout(function () {
      //   html2canvas(document.querySelector("#getSharePicture"), {
      //     allowTaint: true,
      //     useCORS: true,
      //     scale: 1,
      //     imageTimeout: 100000,
      //     proxy: 'secure.download.dm.origin.com'
      //   }).then(canvas => {
      //     that.share.statusSharePicture = true;
      //     document.querySelector("#setSharePicture").after(canvas);
      //     that.share.load = false;
      //   });
      // }, 1000);
    },
  }
}
</script>