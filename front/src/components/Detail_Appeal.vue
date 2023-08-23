<template>
  <div>
    <Button type="primary"
            v-voice-button
            @click="appeal.show = true"
            :disabled="!isLogin || cheater.status !== 1">
      {{ $t('detail.info.appeal') }}
    </Button>

    <!-- 小窗口申诉 S -->
    <Modal v-model="appeal.show"
           width="80%"
           :loading="appeal.load"
           @on-ok="handleAppeal">
      <Button @click="handleAppeal">12</Button>

      <Row :gutter="30">
        <Col :xl="{span: 12}" :lg="{span: 12}">
          <h2> {{ $t('detail.appeal.modal.modalTitle') }} </h2>
          <br>
          <h3> {{ $t('detail.appeal.modal.describe') }} </h3>
          <br>

          <Row style="padding: 0 15px">
            <Col flex="1">
              <ul>
                <li>
                  <h3>
                    <Icon type="md-done-all" color="#19be6b"/>
                    {{ $t('detail.appeal.modal.effectiveEvidence.title') }}
                  </h3>
                  <ol>
                    <li>{{ $t('detail.appeal.modal.effectiveEvidence.1') }}</li>
                    <li>{{ $t('detail.appeal.modal.effectiveEvidence.2') }}</li>
                    <li>{{ $t('detail.appeal.modal.effectiveEvidence.3') }}</li>
                  </ol>
                </li>
                <br>
                <li>
                  <h3>
                    <Icon type="md-done-all" color="#19be6b"/>
                    {{ $t('detail.appeal.modal.auxiliaryProof.title') }}
                  </h3>
                  <ol>
                    <li>{{ $t('detail.appeal.modal.auxiliaryProof.1') }}</li>
                    <li>{{ $t('detail.appeal.modal.auxiliaryProof.2') }}</li>
                  </ol>
                </li>
              </ul>
              <br>
              <ul>
                <li>
                  <h3>
                    <Icon type="ios-alert-outline" color="red"/>
                    {{ $t('detail.appeal.modal.evidenceInvalid.title') }}
                  </h3>
                  <ol>
                    <li>{{ $t('detail.appeal.modal.evidenceInvalid.1') }}</li>
                    <li>{{ $t('detail.appeal.modal.evidenceInvalid.2') }}</li>
                    <li>{{ $t('detail.appeal.modal.evidenceInvalid.3') }}</li>
                    <li>{{ $t('detail.appeal.modal.evidenceInvalid.4') }}</li>
                  </ol>
                </li>
              </ul>
            </Col>
          </Row>
          <br>
        </Col>
        <Col :xl="{span: 12}" :lg="{span: 12}">
          <!-- 基本信息 -->
          <Form label-position="top">
            <Row :gutter="30">
              <Col flex="1">
                <FormItem :label="$t('detail.appeal.info.player')" prop="id">
                  <Input type="text"
                         disabled
                         size="large"
                         :value="cheater.id"
                         :placeholder="$t('detail.placeholder.player')"/>
                </FormItem>
              </Col>
              <Col flex="1">
                <FormItem :label="$t('detail.appeal.info.originName')" prop="originName">
                  <Input type="text"
                         :value="cheater.originName"
                         disabled
                         size="large"/>
                </FormItem>
              </Col>
            </Row>

            <!-- 下拉框，选择对申诉的操作 -->
            <FormItem :label="$t('detail.appeal.deal.type')">
              <Select v-model="appeal.type">
                <Option :value="i.value" v-for="(i, index) in appealType" :key="index">{{ $t(i.name) }}</Option>
              </Select>
            </FormItem>
          </Form>

          <div v-if="appeal.type === 'moss'">
            <Col flex="1">
              <Form ref="detailAppealForm_moss" :model="appeal.fromData" :rules="formRules.moss" label-position="top">
                <Row :gutter="30">
                  <Col flex="1">
                    <!-- 第一人称录屏 -->
                    <FormItem :label="$t('detail.appeal.deal.firstPersonRecording')" prop="videoLink">
                      <Input v-model="appeal.fromData.videoLink"
                             :placeholder="$t('detail.appeal.placeholder.videolink')"/>
                    </FormItem>

                    <!-- BTR链接 -->
                    <FormItem :label="$t('detail.appeal.deal.btrLink')" prop="btrLink">
                      <Input v-model="appeal.fromData.btrLink"
                             :placeholder="$t('detail.appeal.placeholder.btrlink')"/>
                    </FormItem>
                  </Col>
                  <Col flex="1">
                    <!-- MOSS上传按钮 -->
                    <FormItem :label="$t('detail.appeal.deal.mossUpload')">
                      <Upload multiple
                              type="drag"
                              action=""
                              accept="application/*"
                              :before-upload="handleFileMossUpload">
                        <div style="padding: 20px 0" :class="appeal.stateStyle">
                          <Icon type="md-document" size="52"></Icon>
                          {{ appeal.fromData.selectedFile }}
                        </div>
                      </Upload>
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <!-- 玩家的申诉内容 -->
                  <Col flex="1">
                    <FormItem :label="$t('detail.appeal.info.content')" prop="content">
                      <Card dis-hover :padding="0">
                            <Textarea :value="appeal.fromData.content"
                                      ref="textareaAppealContent"
                                      :toolbar="['bold', 'link']"
                                      :height="'420px'"
                                      :placeholder="$t('detail.appeal.placeholder.content')"></Textarea>
                      </Card>
                    </FormItem>
                  </Col>
                </Row>
              </Form>
            </Col>
          </div>
          <div v-show="appeal.type === 'farm'">
            <Col flex="1">
              <Form ref="detailAppealForm_farm" :model="appeal" :rules="formRules.farm">
                <Row :gutter="30">
                  <Col flex="1">
                    <!-- BTR链接 -->
                    <FormItem :label="$t('detail.appeal.deal.btrLink')" prop="btrLink">
                      <Input type="textarea" :rows="3" :maxlength="65535" v-model="appeal.btrLink"
                             :placeholder="$t('detail.appeal.placeholder.btrlink')"></Input>
                    </FormItem>
                  </Col>
                </Row>
                <Row :gutter="30">
                  <Col flex="1">
                    <!-- 玩家的申诉内容 -->
                    <FormItem :label="$t('detail.appeal.info.content')" prop="content">
                      <br>
                      <Card dis-hover :padding="0">
                            <Textarea :value="appeal.content"
                                      ref="textareaAppealContent"
                                      :toolbar="['bold', 'link']"
                                      :height="'200px'"
                                      :placeholder="$t('detail.appeal.placeholder.content')"></Textarea>
                      </Card>
                    </FormItem>
                  </Col>
                </Row>
              </Form>
            </Col>
          </div>
          <div v-show="appeal.type === 'none'">
            <Col>
              <Form ref="detailAppealForm_none" :model="appeal" :rules="formRules.none">
                <Row :gutter="30">
                  <Col flex="1">
                    <!-- 玩家的申诉内容 -->
                    <FormItem :label="$t('detail.appeal.info.content')" prop="content">
                      <Card dis-hover :padding="0">
                            <Textarea :value="appeal.content"
                                      ref="textareaAppealContent"
                                      :toolbar="['bold', 'link']"
                                      :height="'400px'"
                                      :placeholder="$t('detail.appeal.placeholder.content')"></Textarea>
                      </Card>
                    </FormItem>
                  </Col>
                </Row>
              </Form>
            </Col>
          </div>
        </Col>
      </Row>
    </Modal>
    <!-- 小窗口申诉 E -->
  </div>
</template>

<script setup>
import {api, http_token, message, moss, upload} from "@/assets/js";

import Application from "@/assets/js/application";
import PrivilegesTag from "@/components/PrivilegesTag";
import Empty from "@/components/Empty.vue";
import Textarea from "@/components/Textarea.vue";
import BusinessCard from "@/components/businessCard.vue";
import RecordLink from "@/components/RecordLink.vue";
import Captcha from "@/components/Captcha.vue";
import Html from "@/components/Html.vue";
import HtmlWidget from "@/components/HtmlWidget.vue";
import FastReply from "@/components/FastReply.vue";
import htmllink from "@/components/HtmlLink.vue";

export default new Application({
  props: {
    cheater: Object
  },
  data() {
    return {
      appealType: [
        {
          'name': 'detail.appeal.deal.moss',
          'value': 'moss'
        },
        {
          'name': 'detail.appeal.deal.farm',
          'value': 'farm',
        },
        {
          'name': 'detail.appeal.deal.other',
          'value': 'none',
        }
      ],
      formRules: {
        moss: {
          videoLink: [
            {required: true, trigger: 'blur'},
            {type: 'string', max: 255, trigger: 'blur'},
          ],
          btrLink: [
            {request: true, trigger: 'blur'},
            {type: 'string', trigger: 'blur'},
          ],
          content: [
            {request: true, trigger: 'blur'},
            {type: 'string', min: 10, trigger: 'blur'}
          ]
        },
        farm: {
          // btrLink: [
          //   {request: true, trigger: 'blur'},
          //   {type: 'string', min: 1, max: 255, trigger: 'blur'}
          // ],
          // content: [
          //   {request: true, trigger: 'blur'},
          //   {type: 'string', min: 10, trigger: 'blur'}
          // ]
        },
        none: {
          // content: [{request: true, trigger: 'blur'}]
        }
      },
      appeal: {
        load: false,
        show: true,
        fromData: {
          videoLink: '',
          btrLink: '',
          content: '',
          selectedFile: null,
        },
        // disable: this.$store.state.configuration.detailLeftAppealPanel ?? false,
        stateStyle: '',
        toPlayerId: 0,
        type: 'moss',
        mossFileName: '',
        action: ''
      },
    }
  },
  components: {
    Empty,
    Textarea,
    BusinessCard,
    RecordLink,
    Captcha,
    Html,
    HtmlWidget,
    PrivilegesTag,
    FastReply,
    htmllink
  },
  watch: {
    '$route': 'loadData',
  },
  created() {
    this.http = http_token.call(this);
    this.loadData();
  },
  methods: {

    handleSubmit(name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          this.$Message.success('Success!');
        } else {
          this.$Message.error('Fail!');
        }
      })
    },

    async loadData() {
      // set Token Http mode
      this.http = http_token.call(this);
    },
    async getCommentData(commentid) {
      // 发起请求
      let commentData = null;  // 用于保存获取到的数据
      await this.http.get(api["admin_commentItem"], {
        params: {
          id: commentid
        }
      }).then(res => {
        const d = res.data;
        if (d.success === 1) {
          // 请求成功，处理返回的数据
          commentData = {
            id: d.data.id,
            byUsername: d.data.username,
            action: null,
            dbid: d.data.toPlayerId,
            type: d.data.appealType,
            mossFileName: d.data.mossFileName,
            content: d.data.fromData.content,
            firstPersonRecording: d.data.fromData.videoLink,
            btrLink: d.data.fromData.btrLink
          };
        } else {
          switch (d.code) {
            case "commentItem.bad":
            case "commentItem.notFound":
              this.$Message.info(this.$t('basic.tip.notFound'));
              break;
          }
        }
      }).finally(() => {
        // 请求结束后的处理
        // 如果有加载动画，此时应该隐藏
        this.loading = false;
        // 如果有UI元素在请求期间被禁用，此时应该解除禁用
        this.isButtonDisabled = false;
      });

      return commentData;  // 返回获取到的数据
    },
    async admindealAppeal() {
      try {
        const response = await this.http.post(api["admin_setAppeal"], {
          data: {
            id: this.appealdeal.id,
            content: this.appealdeal.admincontent, // 管理回复内容
            action: this.appealdeal.action // 对申诉的操作
          },
        });

        const d = response.data;

        if (d.success === 1) {
          this.$Message.success({content: d.message || d.code, duration: 3});
          return;
        }

        this.$Message.error({content: d.message || d.code, duration: 3});
      } catch (error) {
        this.$Message.error(error.code);
      }
    },
    /**
     * 选择Moss文件
     * @param event
     */
    handleFileMossUpload(file) {
      const that = this;
      that.clearFileMossUpload();

      moss.verifyFileIsMoss(file).then(res => {
        if (res.code == 0) {
          // TO DO 在这里添加上传
          // await upload.on(file);
          that.appeal.stateStyle = 'ivu-alert-success';
          that.$Message.success(res.message);

        } else {
          that.appeal.stateStyle = 'ivu-alert-warning';
          if (res.message) that.$Message.error(res.message);
        }
      })
    },
    /**
     * 清除Moss选择的数据
     */
    clearFileMossUpload() {
      this.appeal.selectedFile = null;
      this.appeal.stateStyle = '';
    },
    /**
     * 提交申诉
     * @returns {Promise<void>}
     */
    handleAppeal() {
      try {
        const type = this.appeal.type;
        const content = this.appeal.content || this.$refs.textareaAppealContent.editorContent;

        // if (!content) return;
        this.appeal.load = true;

        // 验证表单
        this.$refs[`detailAppealForm_${type}`].validate((valid) => {
          console.log(valid);
          if (valid) {
            let postData = {
              data: {
                data: {
                  toPlayerId: this.cheater.id,
                  toOriginPersonaId: this.cheater.originPersonaId,
                  content,
                  appealType: this.appeal.type
                }
              }
            };

            switch (type) {
              case 'moss':
                Object.assign(postData.data.data, {
                  videoLink: this.appeal.fromData.videoLink,
                  btrLink: this.appeal.fromData.btrLink
                });
                break;
              case 'farm':
                Object.assign(postData.data.data, {
                  btrLink: this.appeal.fromData.btrLink
                });
                break;
                // No additional data for 'none' type
            }

            // First, upload the MOSS file if it exists
            let mossFileName = '';
            if (type === 'moss' && this.appeal.selectedFile) {
              upload.on(this.appeal.selectedFile).then(res => {
                if (res && res.code >= 1) {
                  mossFileName = res.filename; // 获取文件的URL
                  Object.assign(postData.data.data, {mossFileName});
                } else {
                  this.$Message.error(res.message || res.code);
                }
              }).catch(err => {
                this.$Message.error(err.message || err.code);
              }).finally(() => {
                this.appeal.load = false;
                message.playSendVoice();
                this.getTimeline();
              });

              // 如果mossFileName没有被设置，则说明上传失败，直接返回
              if (type === 'moss' && !mossFileName) {
                return;
              }
            }

            // Then, submit the appeal
            // const res = await this.http.post(api["player_banAppeal"], postData);
            // const d = res.data;
            //
            // if (d.success === 1) {
            //   this.$Message.success(d.message);
            // } else {
            //   this.$Message.error(d.message || d.code);
            // }
          } else {
            this.$Message.error('Fail!');
          }
        })

      } catch (error) {
        this.$Message.error(error.message || error.code);
      } finally {
        this.appeal.load = false;
        message.playSendVoice();
        // this.getTimeline();
      }

      return false;
    },
    convertToPlainText(html) {
      const div = document.createElement('div');
      div.innerHTML = html;
      return div.textContent;
    },
    getContentField(jsonString) {
      try {
        let obj = JSON.parse(jsonString);
        return obj;
      } catch (e) {
        return jsonString; // 返回原始字符串或处理错误
      }
    }
  },
})
</script>

<style scoped lang="less">

</style>
