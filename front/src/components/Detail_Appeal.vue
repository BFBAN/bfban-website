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
           width="80%">
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

          <Form v-if="appeal.type === 'moss'"
                ref="detailAppealForm_moss"
                :model="appeal.fromData"
                label-position="top">
            <Row :gutter="30">
              <Col flex="1">
                <!-- 第一人称录屏 -->
                <FormItem :label="$t('detail.appeal.deal.firstPersonRecording')"
                          :rules="{required: true, trigger: 'blur'}"
                          :prop="'videoLink'">
                  <Input v-model="appeal.fromData.videoLink"
                         :placeholder="$t('detail.appeal.placeholder.videolink')"/>
                </FormItem>

                <!-- BTR链接 -->
                <FormItem :label="$t('detail.appeal.deal.btrLink')"
                          :rules="{required: true, trigger: 'blur'}"
                          :prop="'btrLink'">
                  <Input v-model="appeal.fromData.btrLink"
                         :placeholder="$t('detail.appeal.placeholder.btrlink')"/>
                </FormItem>
              </Col>
              <Col flex="1">
                <!-- MOSS上传按钮 -->
                <FormItem :label="$t('detail.appeal.deal.userGeneratedMossFile')"
                          :rules="{required: true, trigger: 'blur'}"
                          :prop="'selectedFile'">
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

            <!-- 玩家的申诉内容 -->
            <FormItem :label="$t('detail.appeal.info.content')"
                      :rules="{required: true, min: 10, trigger: 'change'}"
                      :prop="'content'">
              <Card dis-hover :padding="0">
                <Textarea v-model="appeal.fromData.content"
                          ref="farm_textareaAppealContent"
                          :toolbar="['bold', 'link']"
                          :height="'420px'"
                          :placeholder="$t('detail.appeal.placeholder.content')"></Textarea>
              </Card>
            </FormItem>
          </Form>
          <Form v-if="appeal.type === 'farm'" ref="detailAppealForm_farm">
            <!-- BTR链接 -->
            <FormItem :label="$t('detail.appeal.deal.btrLink')"
                      :rules="{required: true, trigger: 'blur'}"
                      :prop="'btrLink'">
              <Input v-model="appeal.fromData.btrLink"
                     :placeholder="$t('detail.appeal.placeholder.btrlink')"/>
            </FormItem>

            <!-- 玩家的申诉内容 -->
            <FormItem :label="$t('detail.appeal.info.content')"
                      :rules="{required: true, min: 10, trigger: 'change'}"
                      :prop="'content'">
              <Card dis-hover :padding="0">
                <Textarea v-model="appeal.fromData.content"
                          ref="farm_textareaAppealContent"
                          :toolbar="['bold', 'link']"
                          :height="'420px'"
                          :placeholder="$t('detail.appeal.placeholder.content')"></Textarea>
              </Card>
            </FormItem>
          </Form>
          <Form v-if="appeal.type === 'none'" ref="detailAppealForm_none">
            <!-- 玩家的申诉内容 -->
            <FormItem :label="$t('detail.appeal.info.content')"
                      :rules="{required: true, min: 10, trigger: 'change'}"
                      :prop="'content'">
              <Card dis-hover :padding="0">
                <Textarea v-model="appeal.fromData.content"
                          ref="none_textareaAppealContent"
                          :toolbar="['bold', 'link']"
                          :height="'420px'"
                          :placeholder="$t('detail.appeal.placeholder.content')"></Textarea>
              </Card>
            </FormItem>
          </Form>

        </Col>
      </Row>

      <div slot="footer">
        <Button size="large" :loading="appeal.load" @click="handleAppeal">{{ $t('basic.button.commit') }}</Button>
      </div>
    </Modal>
    <!-- 小窗口申诉 E -->
  </div>
</template>

<script setup>
import {api, http_token, message, moss, upload} from "@/assets/js";

import Application from "@/assets/js/application";
import Empty from "@/components/Empty.vue";
import Textarea from "@/components/Textarea.vue";
import Captcha from "@/components/Captcha.vue";
import Html from "@/components/Html.vue";

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
      appeal: {
        load: false,
        show: true,
        fromData: {
          videoLink: '',
          btrLink: '',
          content: '',
          selectedFile: null,
        },
        disable: this.$store.state.configuration.detailLeftAppealPanel ?? false,
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
    Captcha,
    Html,
  },
  watch: {
    '$route': 'loadData',
  },
  created() {
    this.http = http_token.call(this);
    this.loadData();
  },
  methods: {
    async loadData() {
      // set Token Http mode
      this.http = http_token.call(this);
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
        const content = this.appeal.content || this.$refs[`${type}_textareaAppealContent`].editorContent;

        this.appeal.load = true;

        // 验证表单
        this.$refs[`detailAppealForm_${type}`].validate(async (valid) => {
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
            const res = await this.http.post(api["player_banAppeal"], postData);
            const d = res.data;

            if (d.success === 1) {
              this.$Message.success(d.message);
            } else {
              this.$Message.error(d.message || d.code);
            }
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
  },
})
</script>

<style scoped lang="less">

</style>
