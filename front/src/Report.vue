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
            <Checkbox label="wallhack">
              <span>透视</span>
            </Checkbox>
            <Checkbox label="damageChange">
              <span>改伤</span>
            </Checkbox>
            <Checkbox label="aimbot">
              <span>自瞄</span>
            </Checkbox>
            <Checkbox label="oneShotKill">
              <span>秒杀</span>
            </Checkbox>
            <Checkbox label="gadgetModify">
              <span>改装备</span>
            </Checkbox>
            <Checkbox label="stealth">
              <span>隐身</span>
            </Checkbox>
            <Checkbox label="shootingThroughWalls">
              <span>子弹穿墙</span>
            </Checkbox>
          </CheckboxGroup>
        </FormItem>

        <FormItem label="视频链接">
          <span class="hint">可以是 优酷，土豆，AB站等 视频网站链接</span>
          <Input v-model="formItem.bilibiliLink" placeholder="选填" />
        </FormItem>

        <FormItem label="论述">
          <span class="hint">请列出阐明足够的证据，编辑器支持上传图片（限制2M）、视频（限制30M）</span>
          <!-- <Input v-model="formItem.description" type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="Enter something..." /> -->
          <Misc :content="formItem.description" @change="handleMiscChange" />
        </FormItem>

        <FormItem label="验证码">
          <Input type="text" v-model="formItem.captcha" placeholder="验证码" />
          <img ref="captcha">
          <a href="#" @click.stop.prevent="refreshCaptcha">
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
import Misc from './Misc.vue';

import { checkIdExist, checkReportFormData, trimAllWhitespace } from "./common";

export default {
  data() {
     return {
        formItem: {
          gameName: '',
          originId: '',
          bilibiliLink: '',
          checkbox: ['aimbot'],
          description: '',
          captcha: '',
        },
        spinShow: false,
     }
  },
  components: {
    Misc
  },
  methods: {
    waitForCaptcha(e) {
      e.target.style = "display: none;";
      let span = document.createElement('span');
      e.target.parentNode.insertBefore(span, e.target.nextSibling);

      let n = 2;
      span.innerText = `${n} 秒后重新获取`;
      let si = setInterval(function() {
        if (n > 1) {

          n -= 1;
          span.innerText = `${n} 秒后重新获取`;
        } else {
          e.target.style = "";
          span.innerText = '';
          clearInterval(si);
        }
      }, 1000);
    },
    checkVideoAndImg() {
      if (this.formItem.bilibiliLink || /\<img\ssrc\=\"/.test(this.formItem.description)) {
        return true;
      } else {
        this.$Message.error('必须视频链接和图片二选一');
        return false;
      }
    },
    refreshCaptcha(e) {
      this.$refs.captcha.src = '/captcha?r=' + Math.random();

      this.waitForCaptcha(e);
    },
    handleMiscChange: function(h) {
      this.formItem.description = h
    },
    doReport(e) {
      // check form data
      if (checkReportFormData.call(this, this.formItem) === false) return false;
      if (this.checkVideoAndImg() === false) return false;

      this.spinShow = true;
      checkIdExist({
        gameName: this.formItem.gameName,
        id: this.formItem.originId.trim()
      })
      .then((res) => {

        const d = res.data;
        const idExist = d.idExist;

        if (idExist) {
          this.handleReport();
        } else {
          this.spinShow = false;

          this.$Message.error('游戏ID不存在，请检查拼写');
          return false;
        }
      });
    },
    handleReport: function() {
      this.spinShow = true;

      let gameName = this.formItem.gameName;
      const cheatMethods = this.formItem.checkbox.join(',');

      const {
        originId,
        bilibiliLink,
        description,
        captcha,
      } = _.each(this.formItem, (v, k, o) => {
        if (k === 'checkbox') return;
        if (k === 'originId') {
          o[k] = trimAllWhitespace(v);
          return;
        }
        o[k] = v.trim();
      });

      axios({
        method: 'post',
        url: '/cheaters/',
        data: {
          gameName,
          originId,
          cheatMethods,
          bilibiliLink,
          description,
          captcha,
        }
      }).then((res) => {
        this.spinShow = false;

        const d = res.data;
        if (d.error === 0) {
          this.$router.push({name: 'cheater', params: {game: gameName, uid: d.data.cheaterUId}});

          this.$Message.success('提交成功');
        } else {
          this.$Message.error('提交失败 ' + d.msg);
        }

        this.formItem.captcha = '';
      });
    }
  }
}
</script>

<style>
</style>

