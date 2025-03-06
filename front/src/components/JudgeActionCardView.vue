<script>
import {account_storage, api, application, http_token, message, util} from "@/assets/js";

import Textarea from "@/components/textarea/index.vue";
import JudgeActionTypeView from "@/components/JudgeActionTypeView.vue";
import JudgeActionTemplateView from "@/components/JudgeActionTemplateView.vue";
import FastReply from "@/components/FastReply.vue";
import PrivilegesTag from "@/components/PrivilegesTag.vue";
import {formatTextarea} from "@/mixins/common";

export default new application({
  props: {
    cheater: {}
  },
  data() {
    return {
      verifySpinShow: false,
      verify: {
        isSubscribeTrace: false,
        isUpdateInformation: false,
        status: 0,
        methods: [],
        choice: [],
        suggestion: '',
      },
      verifyRuleValidate: {
        status: [
          {required: true, trigger: 'change'},
        ],
        methods: [
          {
            trigger: 'change',
            type: 'array',
          },
        ],
        hackerLevel: [
          {required: false, trigger: 'change', type: 'number'},
        ],
        suggestion: [
          {required: true, trigger: 'change'},
        ],
      },
      cheatMethodsGlossary: null,

      hackerLevels: [
        {
          value: 1,
          forbidden: true,
        },
        {
          value: 2,
          forbidden: true,
        },
        {
          value: 3,
          forbidden: true,
        },
        {
          value: 4,
          forbidden: false,
        }
      ],
      fastReply: {
        selected: [],
      },
    }
  },
  components: {
    Textarea,
    PrivilegesTag,
    JudgeActionTypeView,
    JudgeActionTemplateView,
    FastReply,
  },
  watch: {
    'fastReply.selected': function () {
      this.verify.suggestion = '' + this.fastReply.selected.map(i => i);
    },
  },
  created() {
    this.http = http_token.call(this);
    this.loadData();
  },
  methods: {
    async loadData() {
      await util.initUtil().then(res => {
        this.cheaterStatus = res.cheaterStatus;

        // 裁决结果
        this.cheatMethodsGlossary = res.cheatMethodsGlossary;

        // 裁决作弊类型
        this.verify.choice = res.action;
        this.verify.status = this.verify.choice[0].value;
      });
    },
    /**
     * 管理裁判提示锁
     */
    onJudgementLock() {
      if (this.isLogin)
        account_storage.updateConfiguration('judgementTip', true);
    },
    /**
     * 判决快速模板
     * @param  {Object} data
     */
    onFastReply(data) {
      this.fastReply.selected = data;

      if (this.$refs.judgementTextarea && this.fastReply.selected.length > 0) {
        this.$refs.judgementTextarea.updateContent(this.fastReply.selected.toString());
      }

      if (data.length === 0) this.$refs.judgementTextarea.updateContent('');
    },
    /**
     * 提交判决
     */
    async onJudgement() {
      this.$refs.judgeActionVerifyForm.validate((valid) => {
        if (!valid) {
          return;
        }

        const {suggestion, status, hackerLevel} = this.verify;
        const cheatMethods = this.verify.methods;

        if (this.verifySpinShow) return;

        if (['kill', 'guilt'].includes(status) && cheatMethods === '' || suggestion.trim() === '') {
          this.$Message.warning(this.$i18n.t('detail.messages.fillEverything'));
          return false;
        }
        if (suggestion.trim().length < 5 || suggestion === '') {
          // too short
          this.$Message.warning(this.$i18n.t('detail.messages.pleaseExplain'));
          return false;
        }

        // 额外事件
        if (this.verify.isUpdateInformation)
          this.$emit('additional-event', 'updatePlayerInfo');
        if (this.verify.isSubscribeTrace)
          this.$emit('additional-event', 'subscribes');

        // 判决处理
        this.verifySpinShow = true;
        this.http.post(api["player_judgement"], {
          data: {
            data: {
              toPlayerId: this.cheater.id,
              cheatMethods: ['kill', 'guilt'].includes(this.verify.status) ? cheatMethods : null,
              action: this.verify.status,
              content: formatTextarea(suggestion),
              hackerLevel
            },
          }
        }).then(res => {
          const d = res.data;

          if (d.success === 1) {
            // reset verifyForm
            this.verify.status = '';
            this.verify.suggestion = '';
            this.verify.methods = [];
            this.cheater.status = status;

            this.$Message.success(this.$t(`basic.tip['${d.code}']`, {
              message: d.message || ""
            }));
            return;
          }

          this.$Message.error(this.$t(`basic.tip['${d.code}']`, {
            message: d.message || ""
          }));
        }).finally(() => {
          this.verifySpinShow = false;
          this.verify.isSubscribeTrace = !this.verify.isSubscribeTrace;
          this.verify.isUpdateInformation = !this.verify.isUpdateInformation;

          if (this.$refs.judgementTextarea)
            this.$refs.judgementTextarea.updateContent("");

          if (message.playSendVoice)
            message.playSendVoice();

          this.$emit('submit-complete');
        })
      });
    },

    /**
     * 管理裁决玩家申诉
     * @returns {Promise<void>}
     */
    async onAdminTimeLineDealAppeal() {
      try {
        const response = await this.http.post(api["admin_setAppeal"], {
          data: {
            toPlayerId: this.cheater.id,
            // content: this.appealdeal.admincontent, // 管理回复内容
            // action                                 // 对申诉的操作
          },
        });

        const d = response.data;

        if (d.success === 1) {
          this.$emit('additional-event', 'updateTimeline');
          this.$emit('additional-event', 'updatePlayerInfo');

          this.appealdealModal = false;
          this.$Message.success({content: d.message || d.code, duration: 3});
          return;
        }

        this.$Message.error({content: d.message || d.code, duration: 3});
      } catch (error) {
        this.$Message.error(error.code);
      }
    }
    ,
    /**
     * 展开申诉详情
     * @param {string} commentId
     * @returns {Promise<void>}
     */
    async openAppealDealModal(commentId) {
      // 调用API获取申诉数据
      const timelineItem = await this.getTimeLineItemData(commentId);
      const afterHandleTimelineContent = timelineItem.content;
      // 将获取的数据赋值到`appeal`对象上
      this.appealdeal = Object.assign(this.appealdeal, timelineItem);

      // 打开模态框
      this.appealdealModal = true;
    },
  },
  computed: {
    util: () => util,
  }
})
</script>

<template>
  <!-- 管理员裁判 S -->
  <div id="judgement" v-if="isAdmin">
    <div :label="$t('detail.info.adminConsole')">
      <h2 style="margin: 0 0 1rem 0;">
        <Row>
          <Col flex="1">
            <a href="javascript:void(0)">#</a> {{ $t('detail.info.judgement') }}
          </Col>
          <Col class="mobile-hide">
            <PrivilegesTag :data="['admin','super','root','dev','bot']"></PrivilegesTag>
          </Col>
        </Row>
      </h2>

      <Form ref='judgeActionVerifyForm' label-position="top"
            :model="verify"
            :rules="verifyRuleValidate">
        <Row :gutter="30">
          <Col :xs="{span:24}" :lg="{span: 12}">
            <FormItem :label="$t(`detail.judgement.behavior`)" prop="status">
              <Select v-model="verify.status" size="large">
                <!-- 判断选项 -->
                <Option :value="v_i.value"
                        :label="$t(`basic.action.${v_i.value}.text`)"
                        v-for="v_i in verify.choice" :key="v_i.value">
                  <Row>
                    <Col flex="1">
                      {{ $t(`basic.action.${v_i.value}.text`) }}
                    </Col>
                    <Col>
                      <Poptip trigger="hover" :transfer="true" word-wrap width="200"
                              :content="$t(`basic.action.${v_i.value}.describe`)">
                        <Icon type="md-help-circle" size="20"/>
                      </Poptip>
                    </Col>
                  </Row>
                  <PrivilegesTag :data="v_i.privilege"></PrivilegesTag>
                </Option>
              </Select>
            </FormItem>
          </Col>
          <Col :lg="{span: 24}"></Col>
          <Col :xs="{span:24}" :lg="{span: 18}">
            <FormItem v-if="['kill','guilt'].includes(verify.status)"
                      prop="methods"
                      :label="$t(`detail.judgement.methods`)"
                      :rules="Object.assign(verifyRuleValidate.methods[0], {required: ['kill','guilt'].includes(verify.status)})">
              <Select v-model="verify.methods" multiple :placeholder="$t(`detail.judgement.methods`)">
                <Option v-for="method in cheatMethodsGlossary"
                        :key="method.value" :value="method.value" :label="$t(`cheatMethods.${method.value}.title`)">
                  <Row :gutter="10">
                    <Col>
                      {{ $t(`cheatMethods.${method.value}.title`) }}
                    </Col>
                    <Col>
                      <Poptip trigger="hover" transfer>
                        <Icon type="md-help-circle"/>
                        <div slot="content">
                          {{ $t(`cheatMethods.${method.value}.describe`) }}
                        </div>
                      </Poptip>
                    </Col>
                  </Row>
                </Option>
              </Select>
            </FormItem>
          </Col>
          <Col :xs="{span:24}" :lg="{span: 6}" v-if="verify.methods.length > 0">
            <FormItem v-show="['kill','guilt'].includes(verify.status)" prop="hackerLevel" :label="$t(`detail.judgement.hackerLevel`)">
              <Select v-model="verify.hackerLevel" clearable :placeholder="$t(`detail.judgement.hackerLevel`)">
                <Option v-for="level in hackerLevels"
                        :key="level.value"
                        :value="level.value"
                        :disabled="level.forbidden">
                  Lv{{ level.value }}
                </Option>
              </Select>
            </FormItem>
          </Col>
          <Col span="24">
            <FormItem prop="suggestion" :label="$t(`detail.judgement.content`)">

              <Card :padding="0" dis-hover>
                <Textarea v-model="verify.suggestion"
                          ref="judgementTextarea"
                          :height="'250px'"
                          :maxlength="60000"
                          :showMaxlengthLabel="true"
                          :placeholder="$t(`detail.info.writeSomething`)">
                </Textarea>

                <!-- Fast Reply S -->
                <Divider content-position="left" style="margin: 0"></Divider>
                <FastReply ref="fastReply" @change="onFastReply"></FastReply>
                <!-- Fast Reply E -->

              </Card>
            </FormItem>
          </Col>
        </Row>
      </Form>

      <Row :gutter="50">
        <Col :xs="{span:24}" :lg="{span: 8, flex: 1}">
          <JudgeActionTemplateView :fromData="verify" :containerRefs="$refs"></JudgeActionTemplateView>
        </Col>
        <Col :xs="{span:24}" :lg="{span: 8, push: 8}" align="right">
          <br class="desktop-hide">
          <Poptip trigger="hover" content="content" placement="left-start" padding="30" offset="2">
            <Button type="primary"
                    size="large"
                    :long="isMobile"
                    v-voice-button :loading="verifySpinShow"
                    @click.stop.prevent="onJudgement">
              {{ (cheater.appealStatus != '1' && isAdmin) ? $t('basic.button.submit') : "处理申述" }}
            </Button>

            <div slot="content" align="left">
              <div>
                <Checkbox v-model="verify.isUpdateInformation">{{ $t('detail.info.updateButton') }}</Checkbox>
              </div>
              <div>
                <Checkbox v-model="verify.isSubscribeTrace"
                          :disabled="!$store.state.configuration.subscribes">
                  {{ $t('detail.subscribes.tracking') }}
                </Checkbox>
              </div>
            </div>
          </Poptip>

        </Col>
      </Row>
    </div>

    <Spin fix v-if="$store.state.configuration.judgementTip === false">
      <div class="loader">
        <Icon type="md-lock" size="80" style="margin-bottom: 20px"/>

        <Alert>
          <template slot="desc">
            <p class="hint">{{ $t('detail.info.adminManual1') }}</p>
            <p class="hint">{{ $t('detail.info.adminManual2') }}</p>
          </template>
        </Alert>
        <br>
        <Button @click="onJudgementLock" v-voice-button>{{ $t('basic.button.submit') }}</Button>
      </div>
    </Spin>
  </div>
  <!-- 管理员裁判 E -->
</template>

<style scoped lang="less">

</style>
