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

      <Tabs type="card"
            v-model="tabs.count"
            @on-tab-remove="doCancel">
        <TabPane v-for="(tab, index) in tabs.list.length" :key="index"
                 disabled
                 :label="(tabs.list[index].formItem.originId ? tabs.list[index].formItem.originId : tab.toString())">
          <template dis-hover shadow v-if="tabs.list[index].statusOk == 0">
            <Form :label-width="isMobile ? null : 150"
                  :model="tabs.list[index].formItem"
                  :rules="tabs.list[index].ruleValidate"
                  :label-position="isMobile ? 'top' : 'left'"
                  ref="formValidate">
              <!-- 基础信息 S -->
              <Card dis-hover :padding="isMobile ? 20 : 50">
                <!-- 游戏类型 S -->
                <FormItem prop="gameName"
                          :label="`${ $t('report.labels.game') }`">
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
                  <p>{{ $t('basic.games.' + tabs.list[index].formItem.gameName) }}</p>
                </FormItem>
                <!-- 游戏类型 E -->

                <!-- 游戏名称 S -->
                <FormItem prop="originId" :label="$t('report.labels.hackerId')">
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

                  <Row :gutter="30">
                    <Col :xs="{span:24}" :lg="{span: 10}">
                      <AutoComplete
                          v-model="tabs.list[index].formItem.originId"
                          :data="tabs.list[index].players.list"
                          @on-search="handleSearchReportId"
                          maxlength="280"
                          clearable
                          :transfer="true"
                          show-word-limit
                          icon="ios-search"
                          size="large"
                          :placeholder="$t('report.info.onlyOneId')">
                        <template v-if="tabs.list && tabs.list[index].players.length > 0">
                          <div v-for="(option,optionIndex) in tabs.list[index].players" :key="optionIndex" >
                            <Option :value="option.originName" v-if="option && option.originName">
                              <Row>
                                <Col flex="auto">
                                  <Avatar :src="option.avatarLink"></Avatar>
                                  <span>&emsp; {{ option.originName }}</span>
                                </Col>
                              </Row>
                            </Option>
                          </div>
                        </template>
                      </AutoComplete>
                    </Col>
                  </Row>

                  <Card class="report-hackrid" dis-hover>
                    <div slot="title">
                      <h1 v-if="tabs.list[index].formItem.originId">{{ tabs.list[index].formItem.originId }}</h1>
                      <span v-else>ID</span>
                    </div>
                    <p class="hint">
                      {{ $t("report.info.idNotion1") }}
                    </p>
                    <p class="hint">
                      {{ $t("report.info.idNotion2") }}
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
                      <Alert type="warning">
                        {{ $t("report.info.uploadManual1") }}
                        <a target="_blank" href="https://streamable.com/">https://streamable.com/</a>，{{
                          $t("report.info.uploadManual2")
                        }}
                      </Alert>

                      <!-- 视频链接 S -->
                      <FormItem
                          :prop="`videoLink[${blinkindex}]`"
                          :rules="{validator: checkVideoLink, trigger: 'change'}"
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
                              v-if="tabs.list[index].formItem.videoLink.length < 10">
                        <Icon type="md-add"/>
                        <span>&emsp; ({{ tabs.list[index].formItem.videoLink.length || 0 }} / 10)</span>
                      </Button>
                      <span>{{ $t("report.info.uploadManual3") }}</span>
                      <!-- 视频链接 E -->
                    </Col>
                  </Row>
                </FormItem>

                <FormItem prop="description" :label="$t('report.labels.description')">
                  <Card :padding="0" dis-hover>
                    <Textarea :placeholder="$t('report.info.description')"
                              :index="index"
                              :height="'520px'"
                              v-model="tabs.list[index].formItem.description">
                              @change="handleMiscChange"
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
                      v-model="tabs.list[index].formItem.captcha"
                      :placeholder="$t('captcha.title')"/>
                  <div v-html="tabs.list[index].captchaUrl.content"></div>
                  <a
                      ref="reCaptcha"
                      href="#"
                      @click.stop.prevent="refreshCaptcha(index)">
                    {{ $t("captcha.get") }}
                  </a>
                </FormItem>

                <FormItem>
                  <Button type="dashed" size="large" :disabled="tabs.list.length <= 1" @click="doCancel" v-voice-button>
                    {{ $t("basic.button.cancel") }}
                  </Button>
                  <Divider type="vertical"/>
                  <Button @click="doReport(index)"
                          v-voice-button
                          type="primary"
                          size="large">
                    {{ $t("basic.button.report") }}
                  </Button>
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
              <Icon type="md-bug" size="200" color="error" />
              <h1 class="tip">{{ $t('report.messages.failureTitle') }}</h1>
              <p class="tip">{{ $t('report.messages.failureSubtitle', {msg: tabs.list[index].statusMsg || ':(' }) }}</p>
              <Divider dashed />
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
              <Icon type="md-cloud-done" size="200" color="success" />
              <h1 class="tip">{{ $t('report.messages.successTitle') }}</h1>
              <p class="tip">{{ $t('report.messages.successSubtitle') }}</p>
              <Divider dashed />
              <Row :gutter="10" type="flex" justify="center" align="middle">
                <Col>
                  <router-link :to="{path: '/report', params: { t: new Date().getTime() }}">
                    <Button v-voice-button>{{ $t('report.button.continue') }}</Button>
                  </router-link>
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

<script>
import BFBAN from "../assets/js/bfban";

import {api, http, http_token, voice, util, regular} from '../assets/js/index'
import {checkReportFormData} from "@/mixins/common";

import gameName from '/public/conf/gameName.json'
import Textarea from "@/components/Textarea.vue";
import store from "@/store";

export default new BFBAN({
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
  components: {Textarea},
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
      util.initUtil().then((res) => {
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
        // 检索列表
        players: {
          list: []
        },
        // form data
        formItem: {
          gameName: gameName.child[gameName.defaultIndex].value,
          originId: "",
          videoLink: [],
          checkbox: [],
          description: "",
          captcha: "",
          originUserId: "",
          originPersonaId: "",
          avatarLink: "",
        },
        // form rule
        ruleValidate: {
          gameName: [
            {required: true, trigger: 'blur'}
          ],
          originId: [
            {required: true, trigger: 'blur',error: '233'}
          ],
          checkbox: [
            {required: true, type: 'array', min: 1, trigger: 'change'},
          ],
          description: [
            {required: true, trigger: 'blur'},
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
      FROM.formItem.videoLink.splice(FROM.formItem.videoLink.length + 1, 0, '');
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

      // 正则校验
      const reg = regular.check('link', val);
      if (reg.code != 0) {
        callback(new Error(this.$i18n.t(errorText)));
        return;
      }

      callback()
    },
    /**
     * 更新或刷新验证码
     * @param index
     */
    refreshCaptcha(index) {
      http.get(api["captcha"], {
        params: {
          r: Math.random()
        }
      }).then(res => {
        if (res.data.success === 1) {
          this.tabs.list[index].captchaUrl = res.data.data;
        }
      });
    },
    /**
     * 取消当前标签的举报
     * 同删除此标签
     */
    doCancel() {
      if (this.tabs.list.length <= 1) {
        return;
      }
      this.tabs.count = 0;
      this.tabs.list.splice(this.tabs.count, 1);
    },
    /**
     * 发布当前标签的举报
     * @param index tabs index
     * @returns {Promise<boolean>}
     */
    async doReport(index) {
      // that form
      let formData = this.tabs.list[index];

      // check form data
      if (checkReportFormData.call(this, formData.formItem) === false) return false;
      // if (regular.check(regular.A, formData.formItem.description).code === -1) return false;

      this.handleReport(formData, index);
      this.refreshCaptcha();
    },
    /**
     * 提交举报
     * @param formData
     * @param index
     */
    handleReport(formData, index) {
      const cheatMethods = formData.formItem.checkbox; // .join(",");
      const {gameName, captcha, originId} = formData.formItem;
      const description = formData.formItem.description.trim();
      const videoLink = formData.formItem.videoLink.toString();

      this.spinShow = true;
      this.http.post(api["player_report"], {
        data: {
          data: {
            game: gameName,
            originName: originId,
            cheatMethods,	// see {{valid_cheatMethod}}
            videoLink,
            description
          },
          encryptCaptcha: this.tabs.list[index].captchaUrl.hash,
          captcha,
        },
      }).then((res) => {
        const d = res.data;

        if (d.success === 1) {
          this.tabs.list[index].statusOk = 1;

          this.voiceReportManagement.play('success');

          this.$Message.success(this.$i18n.t("report.info.success")).then(() => {
            this.$router.push({
              name: "cheater",
              params: { ouid: d.data.originPersonaId },
            });
          });
        } else {
          switch (d.code) {
            case 'judgement.notFound':
              this.$Message.error(this.$i18n.t('report.messages.originIdNotExist'));
              // no such player
              this.failedOfNotFound = true;
              break;
            case 'judgement.permissionDenied':
              this.$Message.error(this.$i18n.t('report.messages.permissionDenied'));
              break;
            case 'originId':
              this.$Message.error(
                  this.$i18n.t("report.info.originId")
              );

              this.tabs.list[index].statusOk = -1;
              break;
            case 'captcha.bad':
              this.tabs.list[index].formItem.captcha = '';
              break;
            default:
              this.$Message.error("failed " + d.message);

              this.tabs.list[index].statusOk = -1;
          }
        }

        this.tabs.list[index].statusMsg = d.message;
      }).finally(() => {
        this.tabs.list[index].formItem.captcha = '';
        this.spinShow = false;
      });
    },
  },
});
</script>

<style lang="less">
@import "./src/assets/css/radio.less";

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