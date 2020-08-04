<template>
  <div class="container">
    <div class="content">
      <Form :label-width="80" style="position: relative;">
	  <!--举报作弊-->
        <Divider>{{ $t('report.info.reportHacker', { msg: 'reportHacker' })}}</Divider>

        <FormItem label="Game">
          <span class="hint">{{ $t('report.info.reportNews', { msg: 'reportNews' })}}</span>
          <RadioGroup v-model="formItem.gameName" type="button">
            <Radio label="bf1"><span>{{ $t('report.info.bf1', { msg: 'bf1' })}}</span></Radio>
            <Radio label="bfv"><span>{{ $t('report.info.bfv', { msg: 'bfv' })}}</span></Radio>
          </RadioGroup>
        </FormItem>


        <FormItem label="Hacker's ID">
          <span class="hint">{{ $t('report.info.idNotion1', { msg: 'idNotion1' })}}</span>
          <span class="hint">{{ $t('report.info.idNotion2', { msg: 'idNotion2' })}}</span>
          <p style="font-size: 2rem;">{{ formItem.originId }}</p>
          <Input v-model="formItem.originId" placeholder="only one Origin ID in one time" />
        </FormItem>

        <FormItem label="CheatMethod">
          <CheckboxGroup v-model="formItem.checkbox">
            <Checkbox v-for="method in cheatMethodsGlossary" :key="method.value" :label="method.value">
              {{$t(`cheatMethods.${method.value}`)}}
            </Checkbox>
          </CheckboxGroup>
        </FormItem>

        <FormItem label="VideoLink">
          <Alert type="warning">
            {{ $t('report.info.uploadManual1', { msg: 'uploadManual1' })}} <a target="_blank" href="https://streamable.com/">https://streamable.com/</a>，{{ $t('report.info.uploadManual2', { msg: 'uploadManual2' })}}
          </Alert>
          <span class="hint">{{ $t('report.info.uploadManual3', { msg: 'uploadManual3' })}}</span>
          <Input v-model="formItem.bilibiliLink" placeholder="Essential" />
        </FormItem>

        <FormItem label="Discription">
          <Alert type="warning">
            {{ $t('report.info.uploadPic1', { msg: 'uploadPic1' })}}
          </Alert>
          <Alert type="warning">
            {{ $t('report.info.uploadPic2', { msg: 'uploadPic2' })}}<a target="_blank" href="https://sm.ms">https://sm.ms</a>，{{ $t('report.info.uploadPic3', { msg: 'uploadPic3' })}}
          </Alert>
          <span class="hint">{{ $t('report.info.uploadPic4', { msg: 'uploadPic4' })}}</span>
          <!-- <Input v-model="formItem.description" type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="Enter something..." /> -->
          <Misc :content="formItem.description" @change="handleMiscChange" />
        </FormItem>

        <FormItem label="验证码">
          <Input type="text" v-model="formItem.captcha" placeholder="Captcha" />
          <img ref="captcha">
          <a ref="reCaptcha" href="#" @click.stop.prevent="refreshCaptcha">
            {{ $t('report.info.getCaptcha', { msg: 'getCaptcha' })}}
          </a>
        </FormItem>

        <FormItem>
          <Button @click="doReport" type="primary">{{ $t('report.info.report', { msg: 'report' })}}</Button>
        </FormItem>

        <Spin size="large" fix v-show="spinShow"></Spin>
      </Form>
    </div>
  </div>
</template>

<script>
  import Misc from '@/components/Misc.vue';
  import {
    checkIdExist,
    checkReportFormData,
    trimAllWhitespace,
    getCsrfToken,
    cheatMethodsGlossary,
    waitForAction
  } from "@/mixins/common";
  import ajax, { baseURL } from "@/mixins/ajax";

  export default {
    data() {
       return {
          formItem: {
            gameName: '',
            originId: '',
            bilibiliLink: '',
            checkbox: ['aimbot'],
            description: '尽可能详细的列举被举报人的作弊证据,write and show your opinion',
            captcha: '',

            originUserId: '',
            originPersonaId: '',
            avatarLink: '',
          },
          spinShow: false,

         cheatMethodsGlossary,
       }
    },
    components: {
      Misc
    },
    methods: {
      checkVideoAndImg() {
        if (trimAllWhitespace(this.formItem.bilibiliLink) || /(http(s?):)([/|.|\w|\s|-])*\.(?:jpe?g|gif|png|bmp)/.test(this.formItem.description)) {
          return true;
        } else {
          this.$Message.error('请上传图片或填写视频链接');
          return false;
        }
      },
      refreshCaptcha() {
        this.$refs.captcha.src = baseURL + '/captcha?r=' + Math.random();

        waitForAction.call(this.$refs.reCaptcha);
      },
      handleMiscChange: function(h) {
        this.formItem.description = h;
      },
      doReport(e) {
        // check form data
        if (checkReportFormData.call(this, this.formItem) === false) return false;
        if (this.checkVideoAndImg() === false) return false;

        this.spinShow = true;
        checkIdExist({
          id: trimAllWhitespace(this.formItem.originId)
        })
        .then(async (res) => {

          const d = res.data;
          const idExist = d.idExist;

          if (idExist) {
            this.formItem.originUserId = d.originUserId;
            this.formItem.originPersonaId = d.originPersonaId;
            this.formItem.avatarLink = d.avatarLink;

            await this.handleReport();
          } else {
            this.spinShow = false;

            this.$Message.error('游戏ID不存在，请检查拼写,ID is not exist');
          }

          this.formItem.captcha = '';
          this.refreshCaptcha();
        });
      },
      handleReport: function() {
        this.spinShow = true;

        const cheatMethods = this.formItem.checkbox.join(',');
        const { gameName, originUserId, originPersonaId, avatarLink, captcha } = this.formItem;

        const originId = trimAllWhitespace(this.formItem.originId);
        let bilibiliLink = trimAllWhitespace(this.formItem.bilibiliLink);
        if (bilibiliLink)
          bilibiliLink = /^https?:\/\//.test(bilibiliLink) ? bilibiliLink : '//' + bilibiliLink;
        const description = this.formItem.description.trim();

        ajax({
          method: 'post',
          url: '/cheaters/',
          headers: {
            // 'x-csrf-token': getCsrfToken(),
          },
          data: {
            gameName,
            originId,
            cheatMethods,
            bilibiliLink,
            description,
            captcha,
            originUserId,
            originPersonaId,
            avatarLink,
          }
        }).then((res) => {
          this.spinShow = false;

          const d = res.data;
          if (d.error === 0) {
            this.$router.push({name: 'cheater', params: {game: gameName, ouid: d.data.originUserId}});

            this.$Message.success('提交成功');
          } else {
            this.$Message.error('failed ' + d.msg);
          }
        });
      }
    }
  }
</script>

<style>
</style>

