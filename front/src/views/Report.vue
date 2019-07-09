<template>
  <div class="container">
    <div class="content">
      <Form :label-width="80" style="position: relative;">
        <Divider>举报作弊</Divider>

        <FormItem label="游戏名">
          <span class="hint">已经支持 战地V 举报啦！</span>
          <RadioGroup v-model="formItem.gameName" type="button">
            <Radio label="bf1"><span>战地1</span></Radio>
            <Radio label="bfv"><span>战地v</span></Radio>
          </RadioGroup>
        </FormItem>


        <FormItem label="游戏ID">
          <span class="hint">一次只填写一个ID，不要把战队名字写进来，不要写成自己的ID</span>
          <span class="hint">游戏ID是不区分大小写的，但请特别注意区分 i I 1 l L o O 0，正确填写举报ID</span>
          <p style="font-size: 2rem;">{{ formItem.originId }}</p>
          <Input v-model="formItem.originId" placeholder="请一次只填写一个ID" />
        </FormItem>

        <FormItem label="作弊方式">
          <CheckboxGroup v-model="formItem.checkbox">
            <Checkbox v-for="method in cheatMethodsGlossary" :key="method.value" :label="method.value">
              {{ method.label }}
            </Checkbox>
          </CheckboxGroup>
        </FormItem>

        <FormItem label="视频链接">
          <Alert type="warning">
            不想注册国内账号、嫌麻烦，上传视频可以前往 <a target="_blank" href="https://streamable.com/">https://streamable.com/</a>，然后地址贴在下方
          </Alert>  
          <span class="hint">可以是 优酷，土豆，AB站等 视频网站链接</span>
          <Input v-model="formItem.bilibiliLink" placeholder="视频链接选填" />
        </FormItem>

        <FormItem label="论述">
          <span class="hint">请列出阐明足够的证据，编辑器支持上传图片（限制2M）</span>
          <!-- <Input v-model="formItem.description" type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="Enter something..." /> -->
          <Misc :content="formItem.description" @change="handleMiscChange" />
        </FormItem>

        <FormItem label="验证码">
          <Input type="text" v-model="formItem.captcha" placeholder="验证码" />
          <img ref="captcha">
          <a ref="reCaptcha" href="#" @click.stop.prevent="refreshCaptcha">
            获得验证码
          </a>
        </FormItem>

        <FormItem>
          <Button @click="doReport" type="primary">提交</Button>
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
            description: '尽可能详细的列举被举报人的作弊证据',
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
        if (this.formItem.bilibiliLink || /\<img\ssrc\=\"/.test(this.formItem.description)) {
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

            this.$Message.error('游戏ID不存在，请检查拼写');
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
        const bilibiliLink = trimAllWhitespace(this.formItem.bilibiliLink);
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
            this.$Message.error('提交失败 ' + d.msg);
          }
        });
      }
    }
  }
</script>

<style>
</style>

