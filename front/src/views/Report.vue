<template>
  <div class="container">
    <div class="content">
      <br>
      <Row>
        <Col :xs="{push: 1}" :lg="{push: 0}">
          <Breadcrumb>
            <BreadcrumbItem :to="{name: 'home'}">{{ $t("header.index") }}</BreadcrumbItem>
            <BreadcrumbItem>{{ $t("report.info.reportHacker") }}</BreadcrumbItem>
          </Breadcrumb>
        </Col>
      </Row>
      <br>

      <AdsGoogle id="7930151828" style="margin-bottom: 10px"></AdsGoogle>

      <Tabs type="card"
            v-model="tabs.count"
            @on-tab-remove="doCancel">
        <TabPane v-for="(tab, index) in tabs.list.length" :key="index"
                 disabled
                 :label="(tabs.list[index].formItem.originName ? tabs.list[index].formItem.originName : tab.toString())">
          <template dis-hover shadow v-if="tabs.list[index].statusOk == 0">
            <Form :label-width="isMobile ? null : 150"
                  :model="tabs.list[index].formItem"
                  :rules="tabs.list[index].ruleValidate"
                  :label-position="isMobile ? 'top' : 'left'"
                  :ref="`formValidate_${index}`">
              <!-- 基础信息 S -->
              <Card dis-hover :padding="isMobile ? 20 : 50">
                <!-- 游戏类型 S -->
                <FormItem prop="gameName" :label="`${ $t('report.labels.game') }`">
                  <RadioGroup
                      size="large"
                      class="game-type"
                      v-model="tabs.list[index].formItem.gameName"
                      type="button">
                    <Radio :label="i.value" :disabled="i.disabled" v-for="i in games" :key="i.value" aria-radio
                           :style="'background-image: url(' + require('/src/assets/' + i.bk_file + '/bf.jpg') + ')'"
                           :class="tabs.list[index].formItem.gameName == i.value ? 'gametype-select' : ''">
                      <Tooltip :content="$t('basic.games.' + i.value)" placement="top-start">
                        <img height="35" :src="require('/src/assets/' + i.bk_file + '/logo.png')" v-if="i.logo_src"/>
                        <span v-else>{{ i.full_name }}</span>
                      </Tooltip>
                    </Radio>
                  </RadioGroup>
                  <p v-if="tabs.list[index].formItem.gameName">
                    {{ $t('basic.games.' + tabs.list[index].formItem.gameName) }}</p>
                </FormItem>
                <!-- 游戏类型 E -->

                <!-- 游戏名称 S -->
                <FormItem :prop="tabs.list[index].type" :label="$t('report.labels.hackerId')">
                  <Alert type="error"
                         show-icon
                         class="notFoundHint"
                         v-show="failedOfNotFound">
                    <b>{{ $t("report.info.notFoundHintTitle") }}</b>
                    <span slot="desc">
                      <p style="font-size: 14px; margin-left: 10px">
                        Q:{{ $t("report.info.notFoundHintQuestion1") }}
                      </p>
                      <p style="font-size: 12px; margin-left: 20px">
                        A:{{ $t("report.info.notFoundHintAnswer1") }}
                      </p>
                      <p style="font-size: 14px; margin-left: 10px">
                        Q:{{ $t("report.info.notFoundHintQuestion2") }}
                      </p>
                      <p style="font-size: 12px; margin-left: 20px">
                        A:{{ $t("report.info.notFoundHintAnswer2") }}
                      </p>
                    </span>
                  </Alert>
                  <Row :gutter="10" type="flex" align="middle">
                    <Col>
                      <Select v-model="tabs.list[index].type" size="large" style="min-width: 120px">
                        <Option v-for="(type, typeIndex) in tabs.list[index].types" :key="typeIndex" :value="type"
                                :label="$t(`report.labels.types.${type}.name`)">
                          <Row :gutter="5" type="flex" align="middle">
                            <Col :lg="{span: 20}">
                              {{ $t(`report.labels.types.${type}.name`) }}
                            </Col>
                            <Col :lg="{span: 4}">
                              <Poptip trigger="hover" transfer>
                                <Icon type="ios-help-circle-outline"/>
                                <div slot="content">{{ $t(`report.labels.types.${type}.hint`) }}</div>
                              </Poptip>
                            </Col>
                          </Row>
                        </Option>
                      </Select>
                    </Col>
                    <Divider type="vertical"></Divider>
                    <template v-if="tabs.list[index].type == 'originName'">
                      <Col flex="1">
                        <AutoComplete
                            v-model="tabs.list[index].formItem.originName"
                            :data="tabs.list[index].players.list"
                            @on-search="handleSearchReportId"
                            maxlength="280"
                            clearable
                            :transfer="true"
                            show-word-limit
                            icon="ios-search"
                            size="large"
                            :placeholder="$t(`report.labels.types.${tabs.list[index].type}.placeholder`)">
                          <template v-if="tabs.list && tabs.list[index].players.length > 0">
                            <div v-for="(option,optionIndex) in tabs.list[index].players" :key="optionIndex">
                              <Option :value="option.originName" v-if="option && option.originName">
                                <Row :gutter="10" type="flex" justify="center" align="middle">
                                  <Col>
                                    <Avatar :src="option.avatarLink"></Avatar>
                                  </Col>
                                  <Col flex="1">
                                    <span class="text-distinguishing-letter"><code>{{ option.originName }}</code></span>
                                  </Col>
                                </Row>
                              </Option>
                            </div>
                          </template>
                        </AutoComplete>
                      </Col>
                      <Col>
                        <OcrWidget :data="{index}" @ok="onOcrOutput">
                          <Button size="large">
                            <Icon type="md-qr-scanner"/>
                            OCR
                          </Button>
                        </OcrWidget>
                      </Col>
                    </template>
                    <template v-else-if="tabs.list[index].type == 'originPersonaId'">
                      <Col flex="1">
                        <Input v-model="tabs.list[index].formItem.originPersonaId"
                               maxlength="280"
                               clearable
                               show-word-limit
                               size="large"
                               type="number"
                               :transfer="true"
                               :placeholder="$t(`report.labels.types.${tabs.list[index].type}.placeholder`)"></Input>
                      </Col>
                    </template>
                    <template v-else-if="tabs.list[index].type == 'originUserId'">
                      <Col flex="1">
                        <Input v-model="tabs.list[index].formItem.originUserId"
                               maxlength="280"
                               clearable
                               show-word-limit
                               size="large"
                               type="number"
                               :transfer="true"
                               :placeholder="$t(`report.labels.types.${tabs.list[index].type}.placeholder`)"></Input>
                      </Col>
                    </template>
                  </Row>

                  <Card class="report-hackrid" dis-hover v-if="tabs.list[index].type == 'originName'">
                    <div slot="title">
                      <h1 v-if="tabs.list[index].formItem.originName" class="text-distinguishing-letter">
                        <code>{{ tabs.list[index].formItem.originName }}</code></h1>
                      <span v-else>ID</span>
                    </div>
                    <p class="hint">
                      {{ $t("report.info.idNotion1") }}
                    </p>
                    <p class="hint">
                      <code>{{ $t("report.info.idNotion2") }}</code>
                    </p>
                  </Card>
                </FormItem>
                <!-- 游戏名称 S -->

                <FormItem prop="checkbox" :label="$t('report.labels.cheatMethod')">
                  <CheckboxGroup v-model="tabs.list[index].formItem.checkbox">
                    <Checkbox
                        style="margin-bottom: 10px"
                        border
                        v-for="method in cheatMethodsGlossary"
                        :indeterminate="false"
                        :key="method.value"
                        :label="method.value">
                      <Tag color="primary">{{ $t(`cheatMethods.${method.value}.title`) }}</Tag>
                      <Divider type="vertical"/>
                      <span>{{ $t(`cheatMethods.${method.value}.describe`) }}</span>
                    </Checkbox>
                  </CheckboxGroup>
                </FormItem>
              </Card>
              <!-- 基础信息 E -->
              <br>
              <!-- 证据 S -->
              <Card dis-hover :padding="isMobile ? 20 : 50">
                <FormItem :label="$t('detail.info.videoLink')">
                  <Row :gutter="30">
                    <Col :xs="{span: 24}" :lg="{span:12}">
                      <Alert show-icon type="warning">
                        {{ $t("report.info.uploadManual1") }}
                      </Alert>

                      <!-- 视频链接 S -->
                      <FormItem
                          :prop="`videoLink[${blinkindex}]`"
                          :rules="{validator: checkVideoLink, trigger: 'blur'}"
                          v-for="(blink, blinkindex) in tabs.list[index].formItem.videoLink"
                          :key="blinkindex">
                        <Row :gutter="0">
                          <Col flex="auto">
                            <Input
                                style="margin-bottom: 5px"
                                clearable
                                v-model="tabs.list[index].formItem.videoLink[blinkindex]"
                                :placeholder="$t('report.info.required')">
                            </Input>
                          </Col>
                          <Col>
                            <Divider type="vertical" v-if="tabs.list[index].formItem.videoLink.length > 0"/>
                            <Button type="dashed"
                                    @click="tabs.list[index].formItem.videoLink.splice(blinkindex, 1)"
                                    v-voice-button
                                    v-if="tabs.list[index].formItem.videoLink.length > 0">
                              <Icon type="md-trash"/>
                            </Button>
                          </Col>
                        </Row>
                      </FormItem>

                      <Button type="primary"
                              long
                              v-voice-button
                              @click="handleVideoLink"
                              v-if="tabs.list[index].formItem.videoLink.length < 3">
                        <Icon type="md-add"/>
                        <span>&emsp; ({{ tabs.list[index].formItem.videoLink.length || 0 }} / 3)</span>
                      </Button>
                      <!-- 视频链接 E -->

                      <div class="hint">{{ $t("report.info.uploadManual2") }}</div>
                    </Col>
                  </Row>
                </FormItem>

                <FormItem prop="description" :label="$t('report.labels.description')">
                  <Card :padding="0" dis-hover>
                        <Textarea
                            :toolbar="[[{'list': 'ordered'}, {'list': 'bullet'}], ['bold', 'hr'], ['link', 'image']]"
                            :placeholder="$t('report.info.description')"
                            :index="index"
                            :height="'520px'"
                            :maxlength="60000"
                            :showMaxlengthLabel="true"
                            v-model="tabs.list[index].formItem.description">
                        </Textarea>
                  </Card>
                </FormItem>
              </Card>
              <!-- 证据 E -->
              <br>
              <!-- 提交 S -->
              <Card dis-hover :padding="isMobile ? 20 : 50">
                <FormItem prop="captcha" :label="$t('captcha.title')">
                  <Input
                      type="text"
                      maxlength="4"
                      v-model="tabs.list[index].formItem.captcha"
                      :placeholder="$t('captcha.title')">
                    <div slot="append" class="captcha-input-append" :alt="$t('captcha.get')">
                      <Captcha :ref="`report_${index}`" :id="`report_${index}`"></Captcha>
                    </div>
                  </Input>
                  <!--                  <div v-html="tabs.list[index].captchaUrl.content"></div>-->
                  <!--                  <a-->
                  <!--                      ref="reCaptcha"-->
                  <!--                      href="#"-->
                  <!--                      @click.stop.prevent="refreshCaptcha(index)">-->
                  <!--                    {{ $t("captcha.get") }}-->
                  <!--                  </a>-->
                </FormItem>

                <FormItem>
                  <Row :gutter="10" type="flex" align="middle">
                    <Col>
                      <Button type="dashed" size="large" :disabled="tabs.list.length <= 1" @click="doCancel"
                              v-voice-button>
                        {{ $t("basic.button.cancel") }}
                      </Button>
                    </Col>
                    <Divider type="vertical"/>
                    <Col>
                      <Button @click="resetFieldsReport(index)"
                              v-voice-button
                              size="large">
                        {{ $t("basic.button.reset") }}
                      </Button>
                    </Col>
                    <Col>
                      <Button @click="doReport(index)"
                              :loading="tabs.list[index].load"
                              v-voice-button
                              type="primary"
                              size="large">
                        {{ $t("basic.button.report") }}
                      </Button>
                    </Col>
                  </Row>
                </FormItem>
              </Card>
              <!-- 提交 E -->
              <br>
              <Spin size="large" fix v-show="spinShow"></Spin>
            </Form>
          </template>

          <!-- 举报结果 S -->
          <div shadow class="ivu-alert-error" v-else-if="tabs.list[index].statusOk == -1">
            <div class="report-done">
              <Icon type="md-bug" size="200" color="error"/>
              <h1 class="tip">{{ $t('report.messages.failureTitle') }}</h1>
              <p class="tip">{{ $t('report.messages.failureSubtitle', {msg: tabs.list[index].statusMsg || ':('}) }}</p>
              <Divider dashed/>
              <Row :gutter="10" type="flex" justify="center" align="middle">
                <Col>
                  <router-link :to="{name: 'home'}">
                    <Button v-voice-button>{{ $t('report.button.leave') }}</Button>
                  </router-link>
                </Col>
              </Row>
            </div>
          </div>
          <div shadow class="ivu-alert-success" v-else-if="tabs.list[index].statusOk == 1">
            <div class="report-done">
              <Icon type="md-cloud-done" size="200" color="success"/>
              <h1 class="tip">{{ $t('report.messages.successTitle') }}</h1>
              <p class="tip">{{ $t('report.messages.successSubtitle') }}</p>
              <Divider dashed/>
              <Row :gutter="10" type="flex" justify="center" align="middle">
                <Col>
                  <Button v-voice-button><a href="/report">{{ $t('report.button.continue') }}</a></Button>
                </Col>
                <Col>
                  <router-link :to="{name: 'home'}">
                    <Button v-voice-button type="primary">{{ $t('report.button.leave') }}</Button>
                  </router-link>
                </Col>
              </Row>
            </div>
          </div>
          <!-- 举报结果 E -->
        </TabPane>
        <Button @click="handleTabsAdd" size="small" slot="extra" disabled v-voice-button>
          <Icon type="md-add"/>
        </Button>
      </Tabs>
    </div>
  </div>
</template>

<script>import {api, http, http_token, voice, util, regular} from '../assets/js/index'

import Application from "../assets/js/application";
import AdsGoogle from "@/components/ads/google/index.vue";
import Html from "@/components/Html";
import Captcha from "@/components/Captcha";
import Textarea from "@/components/Textarea.vue";
import OcrWidget from "@/components/OcrWidget";
import store from "@/store";
import Promise from "lodash/_Promise";
import Empty from "@/components/Empty.vue";
import HtmlWidget from "@/components/HtmlWidget.vue";

export default new Application({
  data() {
    return {
      voiceReportManagement: voice,
      games: [],
      tabs: {
        count: 0,
        list: [],
      },
      spinShow: false,
      failedOfNotFound: false,
      cheatMethodsGlossary: [],
    };
  },
  components: {AdsGoogle, Textarea, Html, HtmlWidget, OcrWidget, Captcha, Empty},
  created() {
    const message = store.state.configuration['voice_message']

    this.http = http_token.call(this);
    this.voiceReportManagement.addVoice(
        'success',
        this.voiceReportManagement.voiceData({
          src: [
            require('@/assets/voice/dinDon.mp3')
          ],
          volume: (message && message.value) || 1
        })
    );

    this.handleTabsAdd();
    this.loadData();
  },
  watch: {
    '$route': 'loadData',
  },
  methods: {
    loadData() {
      util.initUtil().then(res => {
        this.cheatMethodsGlossary = res.cheatMethodsGlossary;
        this.games = res.gameName;
      });
    },
    /**
     * 查询作弊玩家列表
     * 用于从BFBAN数据库中取现有id，填充名称
     * @param query
     */
    handleSearchReportId(query) {
      if (!query || query.length < 4) return;

      http.get(api["search"], {
        params: {
          param: query,
          type: 'player',
          scope: 'current',
          limit: '6'
        }
      }).then(res => {
        const d = res.data;

        if (d.success === 1) {
          this.tabs.list[Number(this.tabs.count)].players = d.data;
          return;
        }

        this.catch(res);
      }).catch(err => {
        this.tabs.list[Number(this.tabs.count)].players = [];
      });
    },
    /**
     * 添加举报新标签
     * 举报JSON格式
     */
    handleTabsAdd() {
      let newFormData = {
        load: false,
        type: 'originName',
        types: ['originName', 'originUserId', 'originPersonaId'],
        // 检索列表
        players: {
          list: []
        },
        // form data
        formItem: {
          gameName: "",
          originName: "",
          originUserId: "",
          originPersonaId: "",
          videoLink: [],
          checkbox: [],
          description: "",
          captcha: "",
          avatarLink: "",
        },
        // form rule
        ruleValidate: {
          gameName: [
            {required: true, trigger: 'change'}
          ],
          originName: [
            {required: true, trigger: 'blur'}
          ],
          originUserId: [
            {required: true, min: 1, max: 280, trigger: 'blur'}
          ],
          originPersonaId: [
            {required: true, min: 1, max: 280, trigger: 'blur'}
          ],
          checkbox: [
            {required: true, type: 'array', min: 1, trigger: 'change'},
          ],
          description: [
            {required: true, type: 'string', min: 5, trigger: 'change'},
          ],
          captcha: [
            {required: true, trigger: 'blur'}
          ],
        },
        statusOk: 0,
        captchaUrl: {}
      };

      this.tabs.list.push(newFormData);
    },
    /**
     * 添加视频链接
     */
    handleVideoLink() {
      const FROM = this.tabs.list[this.tabs.count];

      // 添加link
      FROM.formItem.videoLink.splice(
          FROM.formItem.videoLink.length + 1,
          0,
          ''
      );
    },
    /**
     * 校验地址
     */
    checkVideoLink(rule, value, callback) {
      const errorText = this.$i18n.t('report.messages.videoBadFormat');
      const val = value;

      if (!val) {
        return callback(this.$i18n.t('report.messages.videoEmpty'));
      }

      if (value.length > 255) {
        return callback("The address is too long and it is recommended that evidence of the link be placed in the 'description'");
      }

      // 正则校验
      const reg = regular.check('link', val);

      if (reg.code != 0) {
        callback(new Error(this.$i18n.t(errorText)));
        return;
      }

      callback()
    },
    /**
     * 取消当前标签的举报
     * 同删除此标签
     */
    doCancel() {
      if (this.tabs.list.length <= 1) return;

      this.tabs.count = 0;
      this.tabs.list.splice(this.tabs.count, 1);
    },
    /**
     * 发布当前标签的举报
     * @param index tabs index
     * @returns {Promise<boolean>}
     */
    async doReport(index) {
      const that = this;
      let formData = this.tabs.list[index];

      try {
        if (!this.$store.state.$userinfo && !this.$store.state.$userinfo.origin.originUserId) {
          this.$Message.error({content: this.$i18n.t("report.messages.tipBind"), duration: 3});
          setTimeout(() => {
            that.$router.push({
              path: '/profile/information'
            })
          }, 3000);

          return;
        }

        // that form
        // check form data
        if (this.$refs['formValidate_' + index][0]) {
          this.$refs['formValidate_' + index][0].validate(async (valid) => {
            if (!valid) {
              that.$Message.error(this.$t("report.messages.videoBadFormat"))
              return
            }

            formData.load = true;

            await that.handleReport(formData, index);
            await that.refreshCaptcha();

            formData.load = false;
          })
          return;
        }

        this.$Message.error({content: this.$i18n.t("basic.tip.needBindEaAccount"), duration: 3});
        setTimeout(() => {
          this.$router.push({
            path: '/profile/information'
          })
        }, 3000)
      } catch (err) {
        this.$Message.error(err.toString());
      } finally {
        formData.load = false;
      }
    },
    /**
     * 重置表单
     * @param index tabs index
     */
    resetFieldsReport(index) {
      this.$refs[`formValidate_${index}`][0].resetFields();
    },
    /**
     * 提交举报
     * @param formData
     * @param index
     */
    handleReport(data, index) {
      const {gameName, captcha, originName, originUserId, originPersonaId} = data.formItem;
      const cheatMethods = data.formItem.checkbox;
      const description = data.formItem.description.trim();
      const videoLink = data.formItem.videoLink.filter(i => i != '' || i != undefined || i != null).toString().trim() || null;
      const formData = {
        data: {
          game: gameName,
          cheatMethods,	// see {{valid_cheatMethod}}
          videoLink,
          description
        },
        encryptCaptcha: this.$refs[`report_${index}`][0].hash,
        captcha,
      };
      let url = ""

      this.spinShow = true;

      switch (formData.type) {
        case "originUserId":
          url = api["player_reportById"];
          formData.data.originUserId = originUserId
          break;
        case "originPersonaId":
          url = api["player_reportById"];
          formData.data.originPersonaId = originPersonaId
          break;
        case "originName":
        default:
          url = api["player_report"];
          formData.data.originName = originName;
          break;
      }

      return new Promise((resolve) => {
        this.http.post(url, {data: formData}).then(res => {
          const d = res.data;

          if (d.success === 1) {
            this.tabs.list[index].statusOk = 1;

            // play voice send
            this.voiceReportManagement.play('success');

            this.$Message.success(this.$t(`basic.tip['${d.code}']`, {
              message: d.message || ""
            })).then(() => {
              this.$router.push({
                name: "cheater",
                params: {ouid: d.data.originPersonaId},
              });
            });
            return;
          }

          this.tabs.list[index].statusMsg = d.message;
          this.$Message.error(this.$t(`basic.tip['${d.code}']`, {
            message: d.message || ""
          }));
        }).finally(() => {
          resolve();
          this.tabs.list[index].formItem.captcha = '';
          this.spinShow = false;
        });
      })
    },
    /**
     * ocr Widget 输出
     */
    onOcrOutput(data) {
      if (!data.value) return;
      this.tabs.list[data.index].formItem.originName = data.value;
    }
  },
});
</script>

<style lang="less" scoped>
@import "@/assets/css/radio.less";

.report-description-box {
  display: block;
  height: 520px !important;

  .ivu-split-pane {
    padding: 0 5px;
  }
}

.report-hackrid {
  margin-top: 20px;

  h1, span {
    font-size: 2rem;
    letter-spacing: .2rem;
  }
}

.report-done {
  padding: 30px 0;
  text-align: center;
}

.report-done .tip {
  margin: 10px 0;
  text-align: center;
}
</style>
